// Platform admin authentication service
import { AppDataSource } from '../../config/data-source';
import { PlatformAdmin } from './platformAdmin.model';
import { logger } from '../../config/logger';
import * as bcrypt from 'bcryptjs';

export class PlatformAuthService {
  private platformAdminRepository = AppDataSource.getRepository(PlatformAdmin);

  /**
   * Login platform admin
   */
  async login(email: string, password: string): Promise<PlatformAdmin> {
    try {
      const platformAdmin = await this.platformAdminRepository.findOne({
        where: { email },
      });

      if (!platformAdmin) {
        throw new Error('Invalid email or password');
      }

      if (!platformAdmin.is_active) {
        throw new Error('Platform admin account is inactive');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, platformAdmin.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      logger.info(`Platform admin logged in: ${platformAdmin.email}`);
      return platformAdmin;
    } catch (error: any) {
      logger.error('Error in platform admin login:', error);
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
      });
    } catch (error: any) {
      logger.error('Error fetching platform admin:', error);
      throw error;
    }
  }
}

