// Platform admin service
import { AppDataSource } from '../../config/data-source';
import { PlatformAdmin } from './platformAdmin.model';
import { Tenant } from '../tenancy/tenant.model';
import { Admin } from '../admin/admin.model';
import { User } from '../users/user.model';
import { logger } from '../../config/logger';
import * as bcrypt from 'bcryptjs';

export class PlatformService {
  private platformAdminRepository = AppDataSource.getRepository(PlatformAdmin);
  private tenantRepository = AppDataSource.getRepository(Tenant);
  private adminRepository = AppDataSource.getRepository(Admin);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Create a new platform admin (super-superadmin)
   */
  async createPlatformAdmin(data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    created_by?: string;
  }): Promise<PlatformAdmin> {
    try {
      // Check if email already exists
      const existingAdmin = await this.platformAdminRepository.findOne({
        where: { email: data.email },
      });

      if (existingAdmin) {
        throw new Error('Platform admin with this email already exists');
      }

      // Hash password
      const password_hash = await bcrypt.hash(data.password, 10);

      // Create platform admin
      const platformAdmin = this.platformAdminRepository.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password_hash,
        created_by: data.created_by || null,
        is_active: true,
      });

      const savedAdmin = await this.platformAdminRepository.save(platformAdmin);
      logger.info(`Platform admin created: ${savedAdmin.email}`);

      return savedAdmin;
    } catch (error: any) {
      logger.error('Error creating platform admin:', error);
      throw error;
    }
  }

  /**
   * Create tenant and assign superadmin
   */
  async createTenantWithSuperadmin(data: {
    tenant_name: string;
    tenant_code: string;
    plan_id?: string;
    superadmin_email: string;
    superadmin_first_name: string;
    superadmin_last_name: string;
    superadmin_password: string;
    created_by_platform_admin: string;
  }): Promise<{ tenant: Tenant; superadmin: Admin }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify platform admin exists
      const platformAdmin = await this.platformAdminRepository.findOne({
        where: { id: data.created_by_platform_admin },
      });

      if (!platformAdmin) {
        throw new Error('Platform admin not found');
      }

      // Check if tenant code already exists
      const existingTenant = await this.tenantRepository.findOne({
        where: { code: data.tenant_code },
      });

      if (existingTenant) {
        throw new Error('Tenant with this code already exists');
      }

      // Check if superadmin email already exists (in admins or users)
      const existingAdmin = await this.adminRepository.findOne({
        where: { email: data.superadmin_email },
      });

      if (existingAdmin) {
        throw new Error('Admin with this email already exists');
      }

      // Create tenant
      const tenant = this.tenantRepository.create({
        name: data.tenant_name,
        code: data.tenant_code,
        plan_id: data.plan_id || null,
        status: 'ACTIVE',
        created_by_platform_admin: data.created_by_platform_admin,
      });

      const savedTenant = await queryRunner.manager.save(tenant);

      // Hash superadmin password
      const password_hash = await bcrypt.hash(data.superadmin_password, 10);

      // Create superadmin in admins table
      const superadmin = this.adminRepository.create({
        email: data.superadmin_email,
        first_name: data.superadmin_first_name,
        last_name: data.superadmin_last_name,
        password_hash,
        tenant_id: savedTenant.id,
        admin_level: 'SUPER_ADMIN',
        is_super_admin: true,
        module_scope: null, // Superadmin has access to all modules
        is_active: true,
        created_by: null, // Platform admin is not an admin, so created_by is null
        user_id: null, // No link to user account initially
      });

      const savedSuperadmin = await queryRunner.manager.save(superadmin);

      // Link superadmin to tenant
      savedTenant.super_admin_id = savedSuperadmin.id;
      await queryRunner.manager.save(savedTenant);

      await queryRunner.commitTransaction();

      logger.info(`Tenant created: ${savedTenant.name} with superadmin: ${savedSuperadmin.email}`);

      return {
        tenant: savedTenant,
        superadmin: savedSuperadmin,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error('Error creating tenant with superadmin:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all tenants (for platform admin dashboard)
   */
  async getAllTenants(): Promise<Tenant[]> {
    try {
      return await this.tenantRepository.find({
        relations: ['superAdmin', 'createdByPlatformAdmin'],
        order: { created_at: 'DESC' },
      });
    } catch (error: any) {
      logger.error('Error fetching tenants:', error);
      throw error;
    }
  }

  /**
   * Get tenant analytics (employee counts, etc.)
   */
  async getTenantAnalytics(): Promise<Array<{
    tenant_id: string;
    tenant_name: string;
    tenant_code: string;
    total_users: number;
    total_employees: number;
    total_admins: number;
    total_super_admins: number;
  }>> {
    try {
      const tenants = await this.tenantRepository.find();
      const analytics = [];

      for (const tenant of tenants) {
        const [totalUsers, totalAdmins, totalSuperAdmins] = await Promise.all([
          this.userRepository.count({ where: { tenant_id: tenant.id } }),
          this.adminRepository.count({
            where: { tenant_id: tenant.id, is_super_admin: false },
          }),
          this.adminRepository.count({
            where: { tenant_id: tenant.id, is_super_admin: true },
          }),
        ]);

        analytics.push({
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          tenant_code: tenant.code,
          total_users: totalUsers,
          total_employees: totalUsers, // All users are employees now
          total_admins: totalAdmins,
          total_super_admins: totalSuperAdmins,
        });
      }

      return analytics;
    } catch (error: any) {
      logger.error('Error fetching tenant analytics:', error);
      throw error;
    }
  }

  /**
   * Get platform admin by ID
   */
  async getPlatformAdminById(id: string): Promise<PlatformAdmin | null> {
    try {
      return await this.platformAdminRepository.findOne({
        where: { id },
        relations: ['createdTenants'],
      });
    } catch (error: any) {
      logger.error('Error fetching platform admin:', error);
      throw error;
    }
  }

  /**
   * Get all platform admins
   */
  async getAllPlatformAdmins(): Promise<PlatformAdmin[]> {
    try {
      return await this.platformAdminRepository.find({
        relations: ['creator'],
        order: { created_at: 'DESC' },
      });
    } catch (error: any) {
      logger.error('Error fetching platform admins:', error);
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findOne({
        where: { id },
        relations: ['superAdmin', 'createdByPlatformAdmin'],
      });
    } catch (error: any) {
      logger.error('Error fetching tenant:', error);
      throw error;
    }
  }

  /**
   * Delete tenant (cascade deletes all related data)
   * This will automatically delete:
   * - All admins (superadmins and regular admins) via CASCADE
   * - All users (employees) via CASCADE
   * - All organizations, buildings, floors via CASCADE
   * - All subscriptions, invoices, usage events via CASCADE
   * - All notifications, webhooks, audit logs via CASCADE
   * - All admin assignments, permissions, onboarding requests via CASCADE
   */
  async deleteTenant(id: string): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenant = await this.tenantRepository.findOne({
        where: { id },
        relations: ['admins', 'users'],
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Log what will be deleted (for audit purposes)
      const adminCount = tenant.admins?.length || 0;
      const userCount = tenant.users?.length || 0;

      logger.info(`Deleting tenant: ${tenant.name} (${tenant.code})`, {
        tenant_id: tenant.id,
        admin_count: adminCount,
        user_count: userCount,
      });

      // Delete tenant (CASCADE will automatically delete all related records)
      // The database foreign keys with CASCADE will handle:
      // - admins (via tenant_id CASCADE)
      // - users (via tenant_id CASCADE)
      // - organizations, buildings, floors (via tenant_id CASCADE)
      // - subscriptions, invoices, usage_events (via tenant_id CASCADE)
      // - notifications, webhooks, audit_logs (via tenant_id CASCADE)
      // - admin_assignments, admin_permissions, admin_onboarding_requests (via tenant_id CASCADE)
      await queryRunner.manager.remove(tenant);

      await queryRunner.commitTransaction();

      logger.info(`Tenant deleted successfully: ${tenant.name} (${tenant.code})`, {
        tenant_id: tenant.id,
        deleted_admins: adminCount,
        deleted_users: userCount,
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error('Error deleting tenant:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all users for a specific tenant
   */
  async getTenantUsers(tenantId: string): Promise<User[]> {
    try {
      // Verify tenant exists
      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Try to load with relations, fallback to no relations if tables don't exist
      try {
        return await this.userRepository.find({
          where: { tenant_id: tenantId },
          relations: ['role', 'organization', 'building', 'floor'],
          order: { created_at: 'DESC' },
        });
      } catch (relationError: any) {
        // If relation tables don't exist, load without relations
        if (relationError.message && relationError.message.includes('does not exist')) {
          logger.warn('Some relation tables do not exist, loading users without relations');
          return await this.userRepository.find({
            where: { tenant_id: tenantId },
            order: { created_at: 'DESC' },
          });
        }
        throw relationError;
      }
    } catch (error: any) {
      logger.error('Error fetching tenant users:', error);
      throw error;
    }
  }
}

