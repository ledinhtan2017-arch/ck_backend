import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createOrderValidator,
  updateStatusValidator,
} from '../validators/order.validator.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', authorize('user', 'admin'), createOrderValidator, createOrder);
router.get('/my', authorize('user', 'admin'), getMyOrders);
router.get('/my/:id', authorize('user', 'admin'), getMyOrderById);

// Admin routes
router.get('/', authorize('admin'), getAllOrders);
router.get('/:id', authorize('admin'), getOrderById);
router.patch('/:id/status', authorize('admin'), updateStatusValidator, updateOrderStatus);

export default router;
