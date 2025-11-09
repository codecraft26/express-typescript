// Superadmin authentication service
import { AppDataSource } from '../../config/data-source';
import { Admin } from './admin.model';
import { logger } from '../../config/logger';
import * as bcrypt from 'bcryptjs';

export class AdminAuthService {
  private adminRepository = AppDataSource.getRepository(Admin);

  /**
   * Login admin or superadmin (unified login for both)
   */
  async login(email: string, password: string): Promise<Admin> {
    try {
      // Find admin by email (can be either superadmin or regular admin)
      const admin = await this.adminRepository.findOne({
        where: { email },
        relations: ['tenant'],
      });

      if (!admin) {
        throw new Error('Invalid email or password');
      }

      if (!admin.is_active) {
        throw new Error('Admin account is inactive');
      }

      if (!admin.tenant) {
        throw new Error('Admin is not associated with a tenant');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const adminType = admin.is_super_admin ? 'Superadmin' : 'Admin';
      logger.info(`${adminType} logged in: ${admin.email} (Tenant: ${admin.tenant.name}${admin.module_scope ? `, Module: ${admin.module_scope}` : ''})`);
      return admin;
    } catch (error: any) {
      logger.error('Error in admin login:', error);
      throw error;
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string): Promise<Admin | null> {
    try {
      return await this.adminRepository.findOne({
        where: { id },
        relations: ['tenant'],
      });
    } catch (error: any) {
      logger.error('Error fetching admin:', error);
      throw error;
    }
  }
}

