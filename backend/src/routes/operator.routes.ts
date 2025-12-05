import { Router } from 'express';
import { OperatorController } from '../controllers/operator.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// All operator routes require authentication and operator role
router.use(authenticate);
router.use(authorize(UserRole.OPERATOR));

router.get('/dashboard', OperatorController.getDashboard);

export default router;

