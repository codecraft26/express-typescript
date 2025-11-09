// Migration: Create core tables (tenants, users, etc.)
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCoreTables1699999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create tenants table
    const tenantsTableExists = await queryRunner.hasTable('tenants');
    if (!tenantsTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'tenants',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '150',
            },
            {
              name: 'code',
              type: 'varchar',
              length: '50',
              isUnique: true,
            },
            {
              name: 'plan_id',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'varchar',
              length: '20',
              default: "'ACTIVE'",
            },
            {
              name: 'created_by_platform_admin',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'super_admin_id',
              type: 'uuid',
              isNullable: true,
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

      // Create index on tenant code
      await queryRunner.createIndex(
        'tenants',
        new TableIndex({
          name: 'IDX_tenants_code',
          columnNames: ['code'],
          isUnique: true,
        })
      );
    }

    // Create users table
    const usersTableExists = await queryRunner.hasTable('users');
    if (!usersTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'users',
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
              isNullable: true,
            },
            {
              name: 'organization_id',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'building_id',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'floor_id',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'role_id',
              type: 'uuid',
              isNullable: true,
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
              name: 'email',
              type: 'varchar',
              length: '120',
              isUnique: true,
            },
            {
              name: 'employee_id',
              type: 'varchar',
              length: '50',
              isNullable: true,
              isUnique: true,
            },
            {
              name: 'department',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'employee_grade',
              type: 'varchar',
              length: '50',
              isNullable: true,
            },
            {
              name: 'phone',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
            {
              name: 'password_hash',
              type: 'text',
            },
            {
              name: 'module_scope',
              type: 'varchar',
              length: '50',
              default: "'CORE'",
            },
            {
              name: 'is_active',
              type: 'boolean',
              default: true,
            },
            {
              name: 'created_by',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'admin_level',
              type: 'varchar',
              length: '20',
              default: "'EMPLOYEE'",
            },
            {
              name: 'is_super_admin',
              type: 'boolean',
              default: false,
            },
            {
              name: 'is_super_super_admin',
              type: 'boolean',
              default: false,
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

      // Create foreign key from users to tenants
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          columnNames: ['tenant_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'tenants',
          onDelete: 'CASCADE',
        })
      );

      // Create self-referential foreign key for created_by
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          columnNames: ['created_by'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'SET NULL',
        })
      );

      // Create index on tenant_id
      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_users_tenant_id',
          columnNames: ['tenant_id'],
        })
      );

      // Create unique index on email
      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_users_email',
          columnNames: ['email'],
          isUnique: true,
        })
      );
    }

    // Add foreign key from tenants to users (super_admin_id) if users table exists
    const tenantsTable = await queryRunner.getTable('tenants');
    const usersTable = await queryRunner.getTable('users');
    
    if (tenantsTable && usersTable) {
      // Check if foreign key already exists
      const existingFkSuperAdmin = tenantsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('super_admin_id') !== -1
      );
      
      if (!existingFkSuperAdmin) {
        await queryRunner.createForeignKey(
          'tenants',
          new TableForeignKey({
            columnNames: ['super_admin_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          })
        );
      }
    }

    // Add trigger to update updated_at timestamp for tenants
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
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
        WHERE tgname = 'update_tenants_updated_at'
      );
    `);

    if (!updateTriggerExists[0].exists) {
      await queryRunner.query(`
        CREATE TRIGGER update_tenants_updated_at
        BEFORE UPDATE ON tenants
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);

    // Drop foreign keys
    const tenantsTable = await queryRunner.getTable('tenants');
    if (tenantsTable) {
      const fkSuperAdmin = tenantsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('super_admin_id') !== -1
      );
      if (fkSuperAdmin) {
        await queryRunner.dropForeignKey('tenants', fkSuperAdmin);
      }
    }

    const usersTable = await queryRunner.getTable('users');
    if (usersTable) {
      const fkTenant = usersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant) {
        await queryRunner.dropForeignKey('users', fkTenant);
      }

      const fkCreatedBy = usersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by') !== -1
      );
      if (fkCreatedBy) {
        await queryRunner.dropForeignKey('users', fkCreatedBy);
      }
    }

    // Drop tables
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('tenants', true);
  }
}

