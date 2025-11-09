// Admin service
import { AppDataSource } from '../../config/data-source';
import { Admin } from './admin.model';
import { logger } from '../../config/logger';
import * as bcrypt from 'bcryptjs';

export class AdminService {
  private adminRepository = AppDataSource.getRepository(Admin);

  /**
   * Create a new admin (regular admin) by superadmin
   * Superadmin can only create admins in their own tenant
   * module_scope can be a specific module (e.g., "DWAR", "SANGRAH") or "ALL" for access to all modules
   */
  async createAdmin(data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    module_scope: string; // Can be specific module or "ALL" for all modules
    tenant_id: string; // Must match superadmin's tenant
    created_by: string; // Superadmin ID
  }): Promise<Admin> {
    try {
      // Check if email already exists
      const existingAdmin = await this.adminRepository.findOne({
        where: { email: data.email },
      });

      if (existingAdmin) {
        throw new Error('Admin with this email already exists');
      }

      // Verify the creator is a superadmin in the same tenant
      const creator = await this.adminRepository.findOne({
        where: { 
          id: data.created_by,
          tenant_id: data.tenant_id,
          is_super_admin: true,
        },
      });

      if (!creator) {
        throw new Error('Only superadmins can create admins in their tenant');
      }

      // Validate module_scope
      const validModules = ['DWAR', 'SANGRAH', 'SAMMILAN', 'SANDESH', 'FRESH_SERVE', 'ALL'];
      const normalizedScope = data.module_scope.toUpperCase();
      
      if (!validModules.includes(normalizedScope)) {
        throw new Error(`Invalid module_scope. Must be one of: ${validModules.join(', ')}`);
      }

      // Hash password
      const password_hash = await bcrypt.hash(data.password, 10);

      // Create admin (regular admin, not superadmin)
      const admin = this.adminRepository.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password_hash,
        tenant_id: data.tenant_id,
        created_by: data.created_by,
        is_super_admin: false,
        admin_level: 'ADMIN',
        module_scope: normalizedScope, // Store as uppercase
        is_active: true,
      });

      const savedAdmin = await this.adminRepository.save(admin);
      const scopeDisplay = normalizedScope === 'ALL' ? 'ALL modules' : normalizedScope;
      logger.info(`Admin created by superadmin: ${savedAdmin.email} (Tenant: ${data.tenant_id}, Module: ${scopeDisplay})`);

      return savedAdmin;
    } catch (error: any) {
      logger.error('Error creating admin:', error);
      throw error;
    }
  }

  /**
   * Get all admins in a tenant (for superadmin)
   * Supports filtering by module_scope, is_active, and including superadmin
   */
  async getTenantAdmins(
    tenant_id: string, 
    options: {
      includeSuperadmin?: boolean;
      module_scope?: string;
      is_active?: boolean;
    } = {}
  ): Promise<Admin[]> {
    try {
      const where: any = { tenant_id };
      
      // If not including superadmin, filter them out
      if (!options.includeSuperadmin) {
        where.is_super_admin = false;
      }

      // Filter by module_scope if provided
      if (options.module_scope) {
        where.module_scope = options.module_scope.toUpperCase();
      }

      // Filter by is_active if provided
      if (options.is_active !== undefined) {
        where.is_active = options.is_active;
      }

      const admins = await this.adminRepository.find({
        where,
        relations: ['tenant', 'creator'],
        order: { created_at: 'DESC' },
      });

      return admins;
    } catch (error: any) {
      logger.error('Error fetching tenant admins:', error);
      throw error;
    }
  }

  /**
   * Get admin by ID (with tenant validation)
   */
  async getAdminById(id: string, tenant_id?: string): Promise<Admin | null> {
    try {
      const where: any = { id };
      if (tenant_id) {
        where.tenant_id = tenant_id;
      }

      return await this.adminRepository.findOne({
        where,
        relations: ['tenant', 'creator'],
      });
    } catch (error: any) {
      logger.error('Error fetching admin:', error);
      throw error;
    }
  }

  /**
   * Update admin (only by superadmin in same tenant)
   */
  async updateAdmin(
    id: string,
    tenant_id: string,
    updates: {
      first_name?: string;
      last_name?: string;
      module_scope?: string;
      is_active?: boolean;
    }
  ): Promise<Admin> {
    try {
      const admin = await this.adminRepository.findOne({
        where: { id, tenant_id },
      });

      if (!admin) {
        throw new Error('Admin not found in your tenant');
      }

      // Don't allow updating superadmin
      if (admin.is_super_admin) {
        throw new Error('Cannot update superadmin through this endpoint');
      }

      // Validate module_scope if provided
      if (updates.module_scope !== undefined) {
        const validModules = ['DWAR', 'SANGRAH', 'SAMMILAN', 'SANDESH', 'FRESH_SERVE', 'ALL'];
        const normalizedScope = updates.module_scope.toUpperCase();
        
        if (!validModules.includes(normalizedScope)) {
          throw new Error(`Invalid module_scope. Must be one of: ${validModules.join(', ')}`);
        }
        admin.module_scope = normalizedScope;
      }

      // Update fields
      if (updates.first_name !== undefined) admin.first_name = updates.first_name;
      if (updates.last_name !== undefined) admin.last_name = updates.last_name;
      if (updates.is_active !== undefined) admin.is_active = updates.is_active;

      const updatedAdmin = await this.adminRepository.save(admin);
      logger.info(`Admin updated: ${updatedAdmin.email}`);

      return updatedAdmin;
    } catch (error: any) {
      logger.error('Error updating admin:', error);
      throw error;
    }
  }

  /**
   * Delete admin (only by superadmin in same tenant)
   */
  async deleteAdmin(id: string, tenant_id: string): Promise<void> {
    try {
      const admin = await this.adminRepository.findOne({
        where: { id, tenant_id },
      });

      if (!admin) {
        throw new Error('Admin not found in your tenant');
      }

      // Don't allow deleting superadmin
      if (admin.is_super_admin) {
        throw new Error('Cannot delete superadmin through this endpoint');
      }

      await this.adminRepository.remove(admin);
      logger.info(`Admin deleted: ${admin.email}`);
    } catch (error: any) {
      logger.error('Error deleting admin:', error);
      throw error;
    }
  }
}
