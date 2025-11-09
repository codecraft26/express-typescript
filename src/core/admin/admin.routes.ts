// Admin routes (for admin management by superadmin)
import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, requireSuperAdmin } from '../../middleware/authMiddleware';

const router = Router();
const adminController = new AdminController();

// All admin management routes require authentication and superadmin role
router.use(authenticate);
router.use(requireSuperAdmin);

// Admin management endpoints
router.post('/admins', adminController.createAdmin.bind(adminController));
router.get('/admins', adminController.getTenantAdmins.bind(adminController));
router.get('/admins/:id', adminController.getAdminById.bind(adminController));
router.put('/admins/:id', adminController.updateAdmin.bind(adminController));
router.delete('/admins/:id', adminController.deleteAdmin.bind(adminController));

export default router;
