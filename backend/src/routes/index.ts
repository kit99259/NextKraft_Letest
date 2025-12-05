import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import operatorRoutes from './operator.routes';
import customerRoutes from './customer.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/operator', operatorRoutes);
router.use('/customer', customerRoutes);

export default router;

