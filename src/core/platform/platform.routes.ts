// Platform admin routes
import { Router } from 'express';
import { PlatformController } from './platform.controller';
import { authenticate, requirePlatformAdmin } from '../../middleware/authMiddleware';

const router = Router();
const platformController = new PlatformController();

// Platform admin authentication (public)
router.post('/auth/login', platformController.login.bind(platformController));

// Protected routes - require authentication and platform admin role
router.use(authenticate);
router.use(requirePlatformAdmin);

// Platform admin management
router.post('/admins', platformController.createPlatformAdmin.bind(platformController));
router.get('/admins', platformController.getAllPlatformAdmins.bind(platformController));

// Tenant management (by platform admin)
router.post('/tenants', platformController.createTenantWithSuperadmin.bind(platformController));
router.get('/tenants', platformController.getAllTenants.bind(platformController));
router.get('/tenants/:id', platformController.getTenantById.bind(platformController));
router.delete('/tenants/:id', platformController.deleteTenant.bind(platformController));
router.get('/tenants/:id/users', platformController.getTenantUsers.bind(platformController));

// Analytics
router.get('/analytics/tenants', platformController.getTenantAnalytics.bind(platformController));

export default router;

