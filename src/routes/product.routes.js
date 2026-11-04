import { Router } from 'express';
import jwt from 'jsonwebtoken';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
} from '../validators/product.validator.js';

const router = Router();

/**
 * Optional authentication middleware.
 * Attaches user info if a valid token is present, but does not reject unauthenticated requests.
 */
function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Ignore invalid tokens for public routes
  }

  next();
}

// Public routes — optionally pass user context for admin visibility
router.get('/', optionalAuth, getAllProducts);
router.get('/:id', optionalAuth, getProductById);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), createProductValidator, createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProductValidator, updateProduct);
router.patch('/:id/stock', authenticate, authorize('admin'), updateStockValidator, updateStock);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
