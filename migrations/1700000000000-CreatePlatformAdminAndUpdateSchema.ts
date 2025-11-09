// Migration: Create platform_admins table and update schema for admin hierarchy
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreatePlatformAdminAndUpdateSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create platform_admins table
    await queryRunner.createTable(
      new Table({
        name: 'platform_admins',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
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
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '80',
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
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
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
            onUpdate: 'NOW()',
          },
        ],
      }),
      true
    );

    // Add self-referential foreign key for created_by (if it doesn't exist)
    const platformAdminsTable = await queryRunner.getTable('platform_admins');
    const existingFkCreatedBy = platformAdminsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('created_by') !== -1
    );
    if (!existingFkCreatedBy) {
      await queryRunner.createForeignKey(
        'platform_admins',
        new TableForeignKey({
          columnNames: ['created_by'],
          referencedColumnNames: ['id'],
          referencedTableName: 'platform_admins',
          onDelete: 'SET NULL',
        })
      );
    }

    // Check if tenants table exists before modifying it
    const tenantsTableExists = await queryRunner.hasTable('tenants');
    if (tenantsTableExists) {
      // Update tenants table - add platform admin and superadmin fields
      const tenantsTable = await queryRunner.getTable('tenants');
      
      if (!tenantsTable?.findColumnByName('created_by_platform_admin')) {
        await queryRunner.addColumn(
          'tenants',
          new TableColumn({
            name: 'created_by_platform_admin',
            type: 'uuid',
            isNullable: true,
          })
        );
      }

      if (!tenantsTable?.findColumnByName('super_admin_id')) {
        await queryRunner.addColumn(
          'tenants',
          new TableColumn({
            name: 'super_admin_id',
            type: 'uuid',
            isNullable: true,
          })
        );
      }

      // Add foreign key for platform admin
      const existingFkPlatformAdmin = tenantsTable?.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by_platform_admin') !== -1
      );
      if (!existingFkPlatformAdmin) {
        await queryRunner.createForeignKey(
          'tenants',
          new TableForeignKey({
            columnNames: ['created_by_platform_admin'],
            referencedColumnNames: ['id'],
            referencedTableName: 'platform_admins',
            onDelete: 'SET NULL',
          })
        );
      }

      // Add foreign key for superadmin (users table) - only if users table exists
      const usersTableExists = await queryRunner.hasTable('users');
      if (usersTableExists) {
        const existingFkSuperAdmin = tenantsTable?.foreignKeys.find(
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
    }

    // Check if users table exists before modifying it
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      const usersTable = await queryRunner.getTable('users');
      
      // Make tenant_id nullable if it's currently NOT NULL
      const tenantIdColumn = usersTable?.findColumnByName('tenant_id');
      if (tenantIdColumn && !tenantIdColumn.isNullable) {
        await queryRunner.query(`
          ALTER TABLE users 
          ALTER COLUMN tenant_id DROP NOT NULL;
        `);
      }

      // Add admin level fields if they don't exist
      if (!usersTable?.findColumnByName('admin_level')) {
        await queryRunner.addColumn(
          'users',
          new TableColumn({
            name: 'admin_level',
            type: 'varchar',
            length: '20',
            default: "'EMPLOYEE'",
          })
        );
      }

      if (!usersTable?.findColumnByName('is_super_admin')) {
        await queryRunner.addColumn(
          'users',
          new TableColumn({
            name: 'is_super_admin',
            type: 'boolean',
            default: false,
          })
        );
      }

      if (!usersTable?.findColumnByName('is_super_super_admin')) {
        await queryRunner.addColumn(
          'users',
          new TableColumn({
            name: 'is_super_super_admin',
            type: 'boolean',
            default: false,
          })
        );
      }

      if (!usersTable?.findColumnByName('created_by')) {
        await queryRunner.addColumn(
          'users',
          new TableColumn({
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          })
        );

        // Add self-referential foreign key for created_by in users
        await queryRunner.createForeignKey(
          'users',
          new TableForeignKey({
            columnNames: ['created_by'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          })
        );
      }
    }

    // Check if admin_assignments table exists before modifying it
    const adminAssignmentsTableExists = await queryRunner.hasTable('admin_assignments');
    if (adminAssignmentsTableExists) {
      const adminAssignmentsTable = await queryRunner.getTable('admin_assignments');
      
      if (!adminAssignmentsTable?.findColumnByName('is_active')) {
        await queryRunner.addColumn(
          'admin_assignments',
          new TableColumn({
            name: 'is_active',
            type: 'boolean',
            default: true,
          })
        );
      }

      if (!adminAssignmentsTable?.findColumnByName('updated_at')) {
        await queryRunner.addColumn(
          'admin_assignments',
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
            onUpdate: 'NOW()',
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign keys first
    const tenantsTable = await queryRunner.getTable('tenants');
    const usersTable = await queryRunner.getTable('users');
    const adminAssignmentsTable = await queryRunner.getTable('admin_assignments');

    // Remove foreign keys from tenants
    if (tenantsTable) {
      const fkPlatformAdmin = tenantsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by_platform_admin') !== -1
      );
      if (fkPlatformAdmin) {
        await queryRunner.dropForeignKey('tenants', fkPlatformAdmin);
      }

      const fkSuperAdmin = tenantsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('super_admin_id') !== -1
      );
      if (fkSuperAdmin) {
        await queryRunner.dropForeignKey('tenants', fkSuperAdmin);
      }
    }

    // Remove foreign keys from users
    if (usersTable) {
      const fkCreatedBy = usersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by') !== -1
      );
      if (fkCreatedBy) {
        await queryRunner.dropForeignKey('users', fkCreatedBy);
      }
    }

    // Remove foreign keys from platform_admins
    const platformAdminsTable = await queryRunner.getTable('platform_admins');
    if (platformAdminsTable) {
      const fkCreatedBy = platformAdminsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by') !== -1
      );
      if (fkCreatedBy) {
        await queryRunner.dropForeignKey('platform_admins', fkCreatedBy);
      }
    }

    // Remove columns from admin_assignments
    if (adminAssignmentsTable) {
      await queryRunner.dropColumn('admin_assignments', 'is_active');
      await queryRunner.dropColumn('admin_assignments', 'updated_at');
    }

    // Remove columns from users
    if (usersTable) {
      await queryRunner.dropColumn('users', 'created_by');
      await queryRunner.dropColumn('users', 'is_super_super_admin');
      await queryRunner.dropColumn('users', 'is_super_admin');
      await queryRunner.dropColumn('users', 'admin_level');
      
      // Make tenant_id NOT NULL again
      await queryRunner.query(`
        ALTER TABLE users 
        ALTER COLUMN tenant_id SET NOT NULL;
      `);
    }

    // Remove columns from tenants
    if (tenantsTable) {
      await queryRunner.dropColumn('tenants', 'super_admin_id');
      await queryRunner.dropColumn('tenants', 'created_by_platform_admin');
    }

    // Drop platform_admins table
    await queryRunner.dropTable('platform_admins');
  }
}

