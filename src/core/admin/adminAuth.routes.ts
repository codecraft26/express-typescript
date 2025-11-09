// Admin/Superadmin authentication routes (unified)
import { Router } from 'express';
import { AdminAuthController } from './adminAuth.controller';

const router = Router();
const adminAuthController = new AdminAuthController();

// Admin/Superadmin authentication (public) - works for both
router.post('/auth/login', adminAuthController.login.bind(adminAuthController));

export default router;

