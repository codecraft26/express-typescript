// Admin controller
import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AdminAuthService } from './adminAuth.service';
import { logger } from '../../config/logger';
import { ApiResponseUtil } from '../../utils/apiResponse';

const adminService = new AdminService();
const adminAuthService = new AdminAuthService();

export class AdminController {
  /**
   * Create admin (by superadmin)
   * POST /api/v1/admin/admins
   */
  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return ApiResponseUtil.unauthorized(res, 'Authentication required');
      }

      // Only superadmins can create admins
      if (req.user.type !== 'super_admin') {
        return ApiResponseUtil.forbidden(res, 'Only superadmins can create admins');
      }

      const { email, first_name, last_name, password, module_scope } = req.body;

      // Validation
      if (!email || !first_name || !last_name || !password || !module_scope) {
        return ApiResponseUtil.validationError(
          res,
          ['Missing required fields: email, first_name, last_name, password, module_scope']
        );
      }

      if (password.length < 8) {
        return ApiResponseUtil.validationError(
          res,
          ['Password must be at least 8 characters long']
        );
      }

      // Validate module_scope format (will be validated in service, but provide helpful message here)
      const validModules = ['DWAR', 'SANGRAH', 'SAMMILAN', 'SANDESH', 'FRESH_SERVE', 'ALL'];
      const normalizedScope = module_scope.toUpperCase();
      if (!validModules.includes(normalizedScope)) {
        return ApiResponseUtil.validationError(
          res,
          [`Invalid module_scope. Must be one of: ${validModules.join(', ')}. Use "ALL" for access to all modules.`]
        );
      }

      // Get superadmin's tenant_id from JWT token
      const tenant_id = req.user.tenant_id;
      if (!tenant_id) {
        return ApiResponseUtil.error(res, new Error('Superadmin must be associated with a tenant'), 400);
      }

      // Get superadmin ID from token
      const created_by = req.user.id;

      // Verify superadmin exists and is active
      const superadmin = await adminAuthService.getAdminById(created_by);
      if (!superadmin || !superadmin.is_active || !superadmin.is_super_admin) {
        return ApiResponseUtil.forbidden(res, 'Invalid superadmin account');
      }

      // Verify tenant_id matches
      if (superadmin.tenant_id !== tenant_id) {
        return ApiResponseUtil.forbidden(res, 'Tenant mismatch');
      }

      const admin = await adminService.createAdmin({
        email,
        first_name,
        last_name,
        password,
        module_scope,
        tenant_id,
        created_by,
      });

      ApiResponseUtil.created(res, {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        module_scope: admin.module_scope,
        tenant_id: admin.tenant_id,
        is_super_admin: admin.is_super_admin,
        created_at: admin.created_at,
      }, 'Admin created successfully');
    } catch (error: any) {
      logger.error('Error in createAdmin:', error);
      ApiResponseUtil.error(res, error, 400, 'Failed to create admin');
    }
  }

  /**
   * Get all admins in tenant (by superadmin)
   * GET /api/v1/admin/admins
   * 
   * Query Parameters:
   * - include_superadmin: boolean (default: false) - Include superadmin in results
   * - module_scope: string (optional) - Filter by module scope (e.g., "DWAR", "ALL")
   * - is_active: boolean (optional) - Filter by active status
   */
  async getTenantAdmins(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return ApiResponseUtil.unauthorized(res, 'Authentication required');
      }

      // Only superadmins can view all admins
      if (req.user.type !== 'super_admin') {
        return ApiResponseUtil.forbidden(res, 'Only superadmins can view all admins');
      }

      const tenant_id = req.user.tenant_id;
      if (!tenant_id) {
        return ApiResponseUtil.error(res, new Error('Superadmin must be associated with a tenant'), 400);
      }

      // Parse query parameters
      const includeSuperadmin = req.query.include_superadmin === 'true';
      const module_scope = req.query.module_scope as string | undefined;
      const is_active = req.query.is_active !== undefined 
        ? req.query.is_active === 'true' 
        : undefined;

      // Validate module_scope if provided
      if (module_scope) {
        const validModules = ['DWAR', 'SANGRAH', 'SAMMILAN', 'SANDESH', 'FRESH_SERVE', 'ALL'];
        const normalizedScope = module_scope.toUpperCase();
        if (!validModules.includes(normalizedScope)) {
          return ApiResponseUtil.validationError(
            res,
            [`Invalid module_scope. Must be one of: ${validModules.join(', ')}`]
          );
        }
      }

      const admins = await adminService.getTenantAdmins(tenant_id, {
        includeSuperadmin,
        module_scope,
        is_active,
      });

      ApiResponseUtil.success(res, {
        count: admins.length,
        filters: {
          include_superadmin: includeSuperadmin,
          module_scope: module_scope || 'all',
          is_active: is_active !== undefined ? is_active : 'all',
        },
        admins: admins.map(admin => ({
          id: admin.id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
          module_scope: admin.module_scope,
          is_super_admin: admin.is_super_admin,
          admin_level: admin.admin_level,
          is_active: admin.is_active,
          created_at: admin.created_at,
          updated_at: admin.updated_at,
          created_by: admin.creator ? {
            id: admin.creator.id,
            email: admin.creator.email,
          } : null,
        })),
      }, 'Admins retrieved successfully');
    } catch (error: any) {
      logger.error('Error in getTenantAdmins:', error);
      ApiResponseUtil.error(res, error, 500, 'Failed to fetch admins');
    }
  }

  /**
   * Get admin by ID (by superadmin)
   * GET /api/v1/admin/admins/:id
   */
  async getAdminById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return ApiResponseUtil.unauthorized(res, 'Authentication required');
      }

      // Only superadmins can view admin details
      if (req.user.type !== 'super_admin') {
        return ApiResponseUtil.forbidden(res, 'Only superadmins can view admin details');
      }

      const tenant_id = req.user.tenant_id;
      if (!tenant_id) {
        return ApiResponseUtil.error(res, new Error('Superadmin must be associated with a tenant'), 400);
      }

      const { id } = req.params;
      const admin = await adminService.getAdminById(id, tenant_id);

      if (!admin) {
        return ApiResponseUtil.notFound(res, 'Admin not found in your tenant');
      }

      ApiResponseUtil.success(res, {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        module_scope: admin.module_scope,
        is_super_admin: admin.is_super_admin,
        admin_level: admin.admin_level,
        is_active: admin.is_active,
        tenant_id: admin.tenant_id,
        created_at: admin.created_at,
        updated_at: admin.updated_at,
        created_by: admin.creator ? {
          id: admin.creator.id,
          email: admin.creator.email,
        } : null,
      }, 'Admin retrieved successfully');
    } catch (error: any) {
      logger.error('Error in getAdminById:', error);
      ApiResponseUtil.error(res, error, 500, 'Failed to fetch admin');
    }
  }

  /**
   * Update admin (by superadmin)
   * PUT /api/v1/admin/admins/:id
   */
  async updateAdmin(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return ApiResponseUtil.unauthorized(res, 'Authentication required');
      }

      // Only superadmins can update admins
      if (req.user.type !== 'super_admin') {
        return ApiResponseUtil.forbidden(res, 'Only superadmins can update admins');
      }

      const tenant_id = req.user.tenant_id;
      if (!tenant_id) {
        return ApiResponseUtil.error(res, new Error('Superadmin must be associated with a tenant'), 400);
      }

      const { id } = req.params;
      const { first_name, last_name, module_scope, is_active } = req.body;

      const admin = await adminService.updateAdmin(id, tenant_id, {
        first_name,
        last_name,
        module_scope,
        is_active,
      });

      ApiResponseUtil.success(res, {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        module_scope: admin.module_scope,
        is_active: admin.is_active,
        updated_at: admin.updated_at,
      }, 'Admin updated successfully');
    } catch (error: any) {
      logger.error('Error in updateAdmin:', error);
      ApiResponseUtil.error(res, error, 400, 'Failed to update admin');
    }
  }

  /**
   * Delete admin (by superadmin)
   * DELETE /api/v1/admin/admins/:id
   */
  async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return ApiResponseUtil.unauthorized(res, 'Authentication required');
      }

      // Only superadmins can delete admins
      if (req.user.type !== 'super_admin') {
        return ApiResponseUtil.forbidden(res, 'Only superadmins can delete admins');
      }

      const tenant_id = req.user.tenant_id;
      if (!tenant_id) {
        return ApiResponseUtil.error(res, new Error('Superadmin must be associated with a tenant'), 400);
      }

      const { id } = req.params;
      await adminService.deleteAdmin(id, tenant_id);

      ApiResponseUtil.success(res, null, 'Admin deleted successfully');
    } catch (error: any) {
      logger.error('Error in deleteAdmin:', error);
      ApiResponseUtil.error(res, error, 400, 'Failed to delete admin');
    }
  }
}
