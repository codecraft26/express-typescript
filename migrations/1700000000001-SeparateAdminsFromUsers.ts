// Migration: Separate admins and superadmins from users table
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class SeparateAdminsFromUsers1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create admins table (for both Admin and Superadmin)
    const adminsTableExists = await queryRunner.hasTable('admins');
    if (!adminsTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'admins',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'tenant_id',
              type: 'uuid',
            },
            {
              name: 'user_id',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'email',
              type: 'varchar',
              length: '120',
              isUnique: true,
            },
            {
              name: 'first_name',
              type: 'varchar',
              length: '80',
              isNullable: true,
            },
            {
              name: 'last_name',
              type: 'varchar',
              length: '80',
              isNullable: true,
            },
            {
              name: 'password_hash',
              type: 'text',
            },
            {
              name: 'admin_level',
              type: 'varchar',
              length: '20',
              default: "'ADMIN'",
            },
            {
              name: 'is_super_admin',
              type: 'boolean',
              default: false,
            },
            {
              name: 'module_scope',
              type: 'varchar',
              length: '50',
              isNullable: true,
            },
            {
              name: 'created_by',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'is_active',
              type: 'boolean',
              default: true,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'NOW()',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'NOW()',
            },
          ],
        }),
        true
      );

      // Create foreign keys
      await queryRunner.createForeignKey(
        'admins',
        new TableForeignKey({
          columnNames: ['tenant_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'tenants',
          onDelete: 'CASCADE',
        })
      );

      // Optional foreign key to users (if admin is also a user)
      const usersTableExists = await queryRunner.hasTable('users');
      if (usersTableExists) {
        await queryRunner.createForeignKey(
          'admins',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          })
        );
      }

      // Self-referential foreign key for created_by
      await queryRunner.createForeignKey(
        'admins',
        new TableForeignKey({
          columnNames: ['created_by'],
          referencedColumnNames: ['id'],
          referencedTableName: 'admins',
          onDelete: 'SET NULL',
        })
      );

      // Create indexes
      await queryRunner.createIndex(
        'admins',
        new TableIndex({
          name: 'IDX_admins_tenant_id',
          columnNames: ['tenant_id'],
        })
      );

      await queryRunner.createIndex(
        'admins',
        new TableIndex({
          name: 'IDX_admins_email',
          columnNames: ['email'],
          isUnique: true,
        })
      );

      await queryRunner.createIndex(
        'admins',
        new TableIndex({
          name: 'IDX_admins_is_super_admin',
          columnNames: ['is_super_admin'],
        })
      );
    }

    // Migrate existing superadmin users to admins table
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      // Check if users table has superadmin data
      const superadminUsers = await queryRunner.query(`
        SELECT id, tenant_id, email, first_name, last_name, password_hash, 
               admin_level, is_super_admin, module_scope, is_active, created_at, updated_at
        FROM users 
        WHERE is_super_admin = true OR admin_level = 'SUPER_ADMIN'
      `);

      if (superadminUsers && superadminUsers.length > 0) {
        // Insert existing superadmins into admins table
        for (const superadmin of superadminUsers) {
          await queryRunner.query(`
            INSERT INTO admins (
              id, tenant_id, email, first_name, last_name, password_hash,
              admin_level, is_super_admin, module_scope, is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
          `, [
            superadmin.id,
            superadmin.tenant_id,
            superadmin.email,
            superadmin.first_name,
            superadmin.last_name,
            superadmin.password_hash,
            'SUPER_ADMIN',
            true,
            null, // Superadmin has access to all modules
            superadmin.is_active !== false,
            superadmin.created_at || new Date(),
            superadmin.updated_at || new Date(),
          ]);
        }
      }
    }

    // Update tenants table - change super_admin_id foreign key to reference admins
    const tenantsTable = await queryRunner.getTable('tenants');
    if (tenantsTable) {
      // Drop old foreign key if it exists (pointing to users)
      const oldFk = tenantsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('super_admin_id') !== -1 && fk.referencedTableName === 'users'
      );
      if (oldFk) {
        await queryRunner.dropForeignKey('tenants', oldFk);
      }

      // Add new foreign key pointing to admins
      const newFk = tenantsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('super_admin_id') !== -1 && fk.referencedTableName === 'admins'
      );
      if (!newFk) {
        await queryRunner.createForeignKey(
          'tenants',
          new TableForeignKey({
            columnNames: ['super_admin_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'admins',
            onDelete: 'SET NULL',
          })
        );
      }
    }

    // Migrate existing admin users to admins table (non-superadmin admins)
    if (usersTableExists) {
      const adminUsers = await queryRunner.query(`
        SELECT id, tenant_id, email, first_name, last_name, password_hash,
               admin_level, is_super_admin, module_scope, is_active, created_at, updated_at
        FROM users 
        WHERE (admin_level = 'ADMIN' OR (admin_level IS NOT NULL AND admin_level != 'EMPLOYEE'))
          AND (is_super_admin IS NULL OR is_super_admin = false)
      `);

      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          await queryRunner.query(`
            INSERT INTO admins (
              id, tenant_id, email, first_name, last_name, password_hash,
              admin_level, is_super_admin, module_scope, is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
          `, [
            admin.id,
            admin.tenant_id,
            admin.email,
            admin.first_name,
            admin.last_name,
            admin.password_hash,
            admin.admin_level || 'ADMIN',
            false,
            admin.module_scope,
            admin.is_active !== false,
            admin.created_at || new Date(),
            admin.updated_at || new Date(),
          ]);
        }
      }
    }

    // Update admin_assignments table - change admin_id foreign key to reference admins
    const adminAssignmentsTable = await queryRunner.getTable('admin_assignments');
    if (adminAssignmentsTable) {
      // Drop old foreign key if it exists (pointing to users)
      const oldFk = adminAssignmentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('admin_id') !== -1 && fk.referencedTableName === 'users'
      );
      if (oldFk) {
        await queryRunner.dropForeignKey('admin_assignments', oldFk);
      }

      // Add new foreign key pointing to admins
      const newFk = adminAssignmentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('admin_id') !== -1 && fk.referencedTableName === 'admins'
      );
      if (!newFk) {
        await queryRunner.createForeignKey(
          'admin_assignments',
          new TableForeignKey({
            columnNames: ['admin_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'admins',
            onDelete: 'CASCADE',
          })
        );
      }

      // Update created_by foreign key
      const oldCreatedByFk = adminAssignmentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by') !== -1 && fk.referencedTableName === 'users'
      );
      if (oldCreatedByFk) {
        await queryRunner.dropForeignKey('admin_assignments', oldCreatedByFk);
      }

      const newCreatedByFk = adminAssignmentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by') !== -1 && fk.referencedTableName === 'admins'
      );
      if (!newCreatedByFk) {
        await queryRunner.createForeignKey(
          'admin_assignments',
          new TableForeignKey({
            columnNames: ['created_by'],
            referencedColumnNames: ['id'],
            referencedTableName: 'admins',
            onDelete: 'SET NULL',
          })
        );
      }
    }

    // Update admin_onboarding_requests table
    const adminOnboardingRequestsTable = await queryRunner.getTable('admin_onboarding_requests');
    if (adminOnboardingRequestsTable) {
      // Rename user_id to admin_id if it exists
      const hasUserId = adminOnboardingRequestsTable.findColumnByName('user_id');
      if (hasUserId) {
        await queryRunner.query(`
          ALTER TABLE admin_onboarding_requests 
          RENAME COLUMN user_id TO admin_id;
        `);
      }

      // Update foreign keys to reference admins
      const oldAdminIdFk = adminOnboardingRequestsTable.foreignKeys.find(
        (fk) => (fk.columnNames.indexOf('admin_id') !== -1 || fk.columnNames.indexOf('user_id') !== -1) && fk.referencedTableName === 'users'
      );
      if (oldAdminIdFk) {
        await queryRunner.dropForeignKey('admin_onboarding_requests', oldAdminIdFk);
      }

      const newAdminIdFk = adminOnboardingRequestsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('admin_id') !== -1 && fk.referencedTableName === 'admins'
      );
      if (!newAdminIdFk) {
        await queryRunner.createForeignKey(
          'admin_onboarding_requests',
          new TableForeignKey({
            columnNames: ['admin_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'admins',
            onDelete: 'SET NULL',
          })
        );
      }

      // Update approved_by and created_by foreign keys
      ['approved_by', 'created_by'].forEach(async (colName) => {
        const oldFk = adminOnboardingRequestsTable.foreignKeys.find(
          (fk) => fk.columnNames.indexOf(colName) !== -1 && fk.referencedTableName === 'users'
        );
        if (oldFk) {
          await queryRunner.dropForeignKey('admin_onboarding_requests', oldFk);
        }

        const newFk = adminOnboardingRequestsTable.foreignKeys.find(
          (fk) => fk.columnNames.indexOf(colName) !== -1 && fk.referencedTableName === 'admins'
        );
        if (!newFk) {
          await queryRunner.createForeignKey(
            'admin_onboarding_requests',
            new TableForeignKey({
              columnNames: [colName],
              referencedColumnNames: ['id'],
              referencedTableName: 'admins',
              onDelete: 'SET NULL',
            })
          );
        }
      });
    }

    // Update admin_permissions table
    const adminPermissionsTable = await queryRunner.getTable('admin_permissions');
    if (adminPermissionsTable) {
      // Update admin_id foreign key
      const oldAdminIdFk = adminPermissionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('admin_id') !== -1 && fk.referencedTableName === 'users'
      );
      if (oldAdminIdFk) {
        await queryRunner.dropForeignKey('admin_permissions', oldAdminIdFk);
      }

      const newAdminIdFk = adminPermissionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('admin_id') !== -1 && fk.referencedTableName === 'admins'
      );
      if (!newAdminIdFk) {
        await queryRunner.createForeignKey(
          'admin_permissions',
          new TableForeignKey({
            columnNames: ['admin_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'admins',
            onDelete: 'CASCADE',
          })
        );
      }

      // Update granted_by foreign key
      const oldGrantedByFk = adminPermissionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('granted_by') !== -1 && fk.referencedTableName === 'users'
      );
      if (oldGrantedByFk) {
        await queryRunner.dropForeignKey('admin_permissions', oldGrantedByFk);
      }

      const newGrantedByFk = adminPermissionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('granted_by') !== -1 && fk.referencedTableName === 'admins'
      );
      if (!newGrantedByFk) {
        await queryRunner.createForeignKey(
          'admin_permissions',
          new TableForeignKey({
            columnNames: ['granted_by'],
            referencedColumnNames: ['id'],
            referencedTableName: 'admins',
            onDelete: 'SET NULL',
          })
        );
      }
    }

    // Remove admin-related columns from users table (if they exist)
    const usersTable = await queryRunner.getTable('users');
    if (usersTable) {
      const columnsToRemove = ['admin_level', 'is_super_admin', 'is_super_super_admin'];
      
      for (const columnName of columnsToRemove) {
        const column = usersTable.findColumnByName(columnName);
        if (column) {
          await queryRunner.dropColumn('users', columnName);
        }
      }
    }

    // Add trigger to update updated_at timestamp for admins
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_admins_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const updateTriggerExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_admins_updated_at'
      );
    `);

    if (!updateTriggerExists[0].exists) {
      await queryRunner.query(`
        CREATE TRIGGER update_admins_updated_at
        BEFORE UPDATE ON admins
        FOR EACH ROW
        EXECUTE FUNCTION update_admins_updated_at();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_admins_updated_at();`);

    // Revert foreign keys (this is complex, so we'll just drop the admins table)
    // In a real scenario, you'd want to migrate data back to users table first
    
    // Drop admins table
    await queryRunner.dropTable('admins', true);
  }
}

