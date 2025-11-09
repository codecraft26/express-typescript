// Platform admin controller
import { Request, Response } from 'express';
import { PlatformService } from './platform.service';
import { PlatformAuthService } from './platformAuth.service';
import { logger } from '../../config/logger';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { generateToken } from '../../utils/jwt';

const platformService = new PlatformService();
const platformAuthService = new PlatformAuthService();

export class PlatformController {
  /**
   * Create platform admin
   * POST /api/v1/platform/admins
   */
  async createPlatformAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, first_name, last_name, password } = req.body;

      // Validation
      if (!email || !first_name || !last_name || !password) {
        return ApiResponseUtil.validationError(
          res,
          ['Missing required fields: email, first_name, last_name, password']
        );
      }

      if (password.length < 8) {
        return ApiResponseUtil.validationError(
          res,
          ['Password must be at least 8 characters long']
        );
      }

      // Get creator from auth (if authenticated)
      const created_by = (req as any).user?.id || null;

      const platformAdmin = await platformService.createPlatformAdmin({
        email,
        first_name,
        last_name,
        password,
        created_by,
      });

      ApiResponseUtil.created(res, {
        id: platformAdmin.id,
        email: platformAdmin.email,
        first_name: platformAdmin.first_name,
        last_name: platformAdmin.last_name,
        created_at: platformAdmin.created_at,
      }, 'Platform admin created successfully');
    } catch (error: any) {
      logger.error('Error in createPlatformAdmin:', error);
      ApiResponseUtil.error(res, error, 400, 'Failed to create platform admin');
    }
  }

  /**
   * Create tenant with superadmin
   * POST /api/v1/platform/tenants
   */
  async createTenantWithSuperadmin(req: Request, res: Response): Promise<void> {
    try {
      const {
        tenant_name,
        tenant_code,
        plan_id,
        superadmin_email,
        superadmin_first_name,
        superadmin_last_name,
        superadmin_password,
      } = req.body;

      // Validation
      if (
        !tenant_name ||
        !tenant_code ||
        !superadmin_email ||
        !superadmin_first_name ||
        !superadmin_last_name ||
        !superadmin_password
      ) {
        return ApiResponseUtil.validationError(
          res,
          ['Missing required fields: tenant_name, tenant_code, superadmin_email, superadmin_first_name, superadmin_last_name, superadmin_password']
        );
      }

      if (superadmin_password.length < 8) {
        return ApiResponseUtil.validationError(
          res,
          ['Password must be at least 8 characters long']
        );
      }

      // Get platform admin from auth
      const created_by_platform_admin = (req as any).user?.id;
      if (!created_by_platform_admin) {
        return ApiResponseUtil.unauthorized(res, 'Platform admin authentication required');
      }

      const result = await platformService.createTenantWithSuperadmin({
        tenant_name,
        tenant_code,
        plan_id,
        superadmin_email,
        superadmin_first_name,
        superadmin_last_name,
        superadmin_password,
        created_by_platform_admin,
      });

      ApiResponseUtil.created(res, {
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          code: result.tenant.code,
          status: result.tenant.status,
          created_at: result.tenant.created_at,
        },
        superadmin: {
          id: result.superadmin.id,
          email: result.superadmin.email,
          first_name: result.superadmin.first_name,
          last_name: result.superadmin.last_name,
          admin_level: result.superadmin.admin_level,
        },
      }, 'Tenant and superadmin created successfully');
    } catch (error: any) {
      logger.error('Error in createTenantWithSuperadmin:', error);
      ApiResponseUtil.error(res, error, 400, 'Failed to create tenant with superadmin');
    }
  }

  /**
   * Get all tenants
   * GET /api/v1/platform/tenants
   */
  async getAllTenants(req: Request, res: Response): Promise<void> {
    try {
      const tenants = await platformService.getAllTenants();

      ApiResponseUtil.success(res, tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        code: tenant.code,
        status: tenant.status,
        super_admin: tenant.superAdmin
          ? {
              id: tenant.superAdmin.id,
              email: tenant.superAdmin.email,
              first_name: tenant.superAdmin.first_name,
              last_name: tenant.superAdmin.last_name,
            }
          : null,
        created_at: tenant.created_at,
      })), 'Tenants retrieved successfully');
    } catch (error: any) {
      logger.error('Error in getAllTenants:', error);
      ApiResponseUtil.serverError(res, error, 'Failed to fetch tenants');
    }
  }

  /**
   * Get tenant by ID
   * GET /api/v1/platform/tenants/:id
   */
  async getTenantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.validationError(res, ['Tenant ID is required']);
      }

      const tenant = await platformService.getTenantById(id);

      if (!tenant) {
        return ApiResponseUtil.notFound(res, 'Tenant');
      }

      ApiResponseUtil.success(res, {
        id: tenant.id,
        name: tenant.name,
        code: tenant.code,
        status: tenant.status,
        plan_id: tenant.plan_id,
        super_admin: tenant.superAdmin
          ? {
              id: tenant.superAdmin.id,
              email: tenant.superAdmin.email,
              first_name: tenant.superAdmin.first_name,
              last_name: tenant.superAdmin.last_name,
              admin_level: tenant.superAdmin.admin_level,
            }
          : null,
        created_by_platform_admin: tenant.createdByPlatformAdmin
          ? {
              id: tenant.createdByPlatformAdmin.id,
              email: tenant.createdByPlatformAdmin.email,
              first_name: tenant.createdByPlatformAdmin.first_name,
              last_name: tenant.createdByPlatformAdmin.last_name,
            }
          : null,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
      }, 'Tenant retrieved successfully');
    } catch (error: any) {
      logger.error('Error in getTenantById:', error);
      ApiResponseUtil.serverError(res, error, 'Failed to fetch tenant');
    }
  }

  /**
   * Delete tenant
   * DELETE /api/v1/platform/tenants/:id
   */
  async deleteTenant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.validationError(res, ['Tenant ID is required']);
      }

      await platformService.deleteTenant(id);

      ApiResponseUtil.success(res, { id }, 'Tenant deleted successfully');
    } catch (error: any) {
      logger.error('Error in deleteTenant:', error);
      
      if (error.message === 'Tenant not found') {
        return ApiResponseUtil.notFound(res, 'Tenant');
      }
      
      ApiResponseUtil.serverError(res, error, 'Failed to delete tenant');
    }
  }

  /**
   * Get all users for a tenant
   * GET /api/v1/platform/tenants/:id/users
   */
  async getTenantUsers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.validationError(res, ['Tenant ID is required']);
      }

      const users = await platformService.getTenantUsers(id);

      ApiResponseUtil.success(res, users.map((user) => {
        const userData: any = {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          employee_id: user.employee_id,
          department: user.department,
          employee_grade: user.employee_grade,
          phone: user.phone,
          is_active: user.is_active,
          module_scope: user.module_scope,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };

        // Add relation data only if it exists (tables might not exist yet)
        if (user.organization) {
          userData.organization = {
            id: user.organization.id,
            name: (user.organization as any).name,
          };
        } else {
          userData.organization = null;
        }

        if (user.building) {
          userData.building = {
            id: user.building.id,
            name: (user.building as any).name,
          };
        } else {
          userData.building = null;
        }

        if (user.floor) {
          userData.floor = {
            id: user.floor.id,
            name: (user.floor as any).name,
          };
        } else {
          userData.floor = null;
        }

        if (user.role) {
          userData.role = {
            id: user.role.id,
            name: (user.role as any).name,
          };
        } else {
          userData.role = null;
        }

        return userData;
      }), 'Tenant users retrieved successfully');
    } catch (error: any) {
      logger.error('Error in getTenantUsers:', error);
      
      if (error.message === 'Tenant not found') {
        return ApiResponseUtil.notFound(res, 'Tenant');
      }
      
      ApiResponseUtil.serverError(res, error, 'Failed to fetch tenant users');
    }
  }

  /**
   * Get tenant analytics
   * GET /api/v1/platform/analytics/tenants
   */
  async getTenantAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await platformService.getTenantAnalytics();

      ApiResponseUtil.success(res, analytics, 'Tenant analytics retrieved successfully');
    } catch (error: any) {
      logger.error('Error in getTenantAnalytics:', error);
      ApiResponseUtil.serverError(res, error, 'Failed to fetch tenant analytics');
    }
  }

  /**
   * Get all platform admins
   * GET /api/v1/platform/admins
   */
  async getAllPlatformAdmins(req: Request, res: Response): Promise<void> {
    try {
      const admins = await platformService.getAllPlatformAdmins();

      ApiResponseUtil.success(res, admins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        is_active: admin.is_active,
        created_at: admin.created_at,
      })), 'Platform admins retrieved successfully');
    } catch (error: any) {
      logger.error('Error in getAllPlatformAdmins:', error);
      ApiResponseUtil.serverError(res, error, 'Failed to fetch platform admins');
    }
  }

  /**
   * Platform Admin Login
   * POST /api/v1/platform/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Check if req.body exists
      if (!req.body) {
        logger.error('Request body is undefined', {
          headers: req.headers,
          method: req.method,
          url: req.url,
        });
        return ApiResponseUtil.validationError(
          res,
          ['Request body is required. Please ensure Content-Type: application/json header is set.']
        );
      }

      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponseUtil.validationError(
          res,
          ['Email and password are required']
        );
      }

      const platformAdmin = await platformAuthService.login(email, password);

      // Generate JWT token
      const token = generateToken({
        id: platformAdmin.id,
        email: platformAdmin.email,
        type: 'platform_admin',
        tenant_id: null, // Platform admin is not tied to a tenant
      });

      ApiResponseUtil.success(res, {
        id: platformAdmin.id,
        email: platformAdmin.email,
        first_name: platformAdmin.first_name,
        last_name: platformAdmin.last_name,
        token,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '24h',
      }, 'Login successful');
    } catch (error: any) {
      logger.error('Error in platform admin login:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        headers: req.headers,
      });
      
      // Handle specific error types
      if (error.message && error.message.includes('Cannot destructure')) {
        return ApiResponseUtil.validationError(
          res,
          ['Request body is required. Please ensure Content-Type: application/json header is set and body is sent as JSON.']
        );
      }
      
      ApiResponseUtil.unauthorized(res, error.message || 'Login failed');
    }
  }
}

