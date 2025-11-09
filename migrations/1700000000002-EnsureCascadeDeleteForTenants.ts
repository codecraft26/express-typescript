// Migration: Ensure CASCADE delete is set up for all tenant-related foreign keys
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class EnsureCascadeDeleteForTenants1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure admins table has CASCADE delete on tenant_id
    const adminsTable = await queryRunner.getTable('admins');
    if (adminsTable) {
      const fkTenant = adminsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('admins', fkTenant);
        await queryRunner.createForeignKey(
          'admins',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure users table has CASCADE delete on tenant_id
    const usersTable = await queryRunner.getTable('users');
    if (usersTable) {
      const fkTenant = usersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('users', fkTenant);
        await queryRunner.createForeignKey(
          'users',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure admin_assignments table has CASCADE delete on tenant_id
    const adminAssignmentsTable = await queryRunner.getTable('admin_assignments');
    if (adminAssignmentsTable) {
      const fkTenant = adminAssignmentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('admin_assignments', fkTenant);
        await queryRunner.createForeignKey(
          'admin_assignments',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure admin_permissions table has CASCADE delete on tenant_id
    const adminPermissionsTable = await queryRunner.getTable('admin_permissions');
    if (adminPermissionsTable) {
      const fkTenant = adminPermissionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('admin_permissions', fkTenant);
        await queryRunner.createForeignKey(
          'admin_permissions',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure admin_onboarding_requests table has CASCADE delete on tenant_id
    const adminOnboardingRequestsTable = await queryRunner.getTable('admin_onboarding_requests');
    if (adminOnboardingRequestsTable) {
      const fkTenant = adminOnboardingRequestsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('admin_onboarding_requests', fkTenant);
        await queryRunner.createForeignKey(
          'admin_onboarding_requests',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure organizations table has CASCADE delete on tenant_id
    const organizationsTable = await queryRunner.getTable('organizations');
    if (organizationsTable) {
      const fkTenant = organizationsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('organizations', fkTenant);
        await queryRunner.createForeignKey(
          'organizations',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure buildings table has CASCADE delete on tenant_id
    const buildingsTable = await queryRunner.getTable('buildings');
    if (buildingsTable) {
      const fkTenant = buildingsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('buildings', fkTenant);
        await queryRunner.createForeignKey(
          'buildings',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure floors table has CASCADE delete on tenant_id (if it exists)
    const floorsTable = await queryRunner.getTable('floors');
    if (floorsTable) {
      const fkTenant = floorsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('floors', fkTenant);
        await queryRunner.createForeignKey(
          'floors',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure subscriptions table has CASCADE delete on tenant_id
    const subscriptionsTable = await queryRunner.getTable('subscriptions');
    if (subscriptionsTable) {
      const fkTenant = subscriptionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('subscriptions', fkTenant);
        await queryRunner.createForeignKey(
          'subscriptions',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure invoices table has CASCADE delete on tenant_id
    const invoicesTable = await queryRunner.getTable('invoices');
    if (invoicesTable) {
      const fkTenant = invoicesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('invoices', fkTenant);
        await queryRunner.createForeignKey(
          'invoices',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure usage_events table has CASCADE delete on tenant_id
    const usageEventsTable = await queryRunner.getTable('usage_events');
    if (usageEventsTable) {
      const fkTenant = usageEventsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('usage_events', fkTenant);
        await queryRunner.createForeignKey(
          'usage_events',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure notifications table has CASCADE delete on tenant_id
    const notificationsTable = await queryRunner.getTable('notifications');
    if (notificationsTable) {
      const fkTenant = notificationsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('notifications', fkTenant);
        await queryRunner.createForeignKey(
          'notifications',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure webhooks table has CASCADE delete on tenant_id
    const webhooksTable = await queryRunner.getTable('webhooks');
    if (webhooksTable) {
      const fkTenant = webhooksTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('webhooks', fkTenant);
        await queryRunner.createForeignKey(
          'webhooks',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure audit_logs table has CASCADE delete on tenant_id
    const auditLogsTable = await queryRunner.getTable('audit_logs');
    if (auditLogsTable) {
      const fkTenant = auditLogsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('audit_logs', fkTenant);
        await queryRunner.createForeignKey(
          'audit_logs',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }

    // Ensure domains table has CASCADE delete on tenant_id
    const domainsTable = await queryRunner.getTable('domains');
    if (domainsTable) {
      const fkTenant = domainsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1
      );
      if (fkTenant && fkTenant.onDelete !== 'CASCADE') {
        await queryRunner.dropForeignKey('domains', fkTenant);
        await queryRunner.createForeignKey(
          'domains',
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tenants',
            onDelete: 'CASCADE',
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration only ensures CASCADE is set, so no down migration needed
    // The foreign keys will remain with CASCADE delete
  }
}

