import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// All customer routes require authentication and customer role
router.use(authenticate);
router.use(authorize(UserRole.CUSTOMER));

router.get('/dashboard', CustomerController.getDashboard);

export default router;

