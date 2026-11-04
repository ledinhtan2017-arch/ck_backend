import { body } from 'express-validator';

export const createOrderValidator = [
  body('shipping_address')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required'),
  body('recipient_phone')
    .trim()
    .notEmpty()
    .withMessage('Recipient phone is required')
    .isLength({ max: 20 })
    .withMessage('Recipient phone must be at most 20 characters'),
  body('note')
    .optional({ values: 'falsy' })
    .trim(),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.product_id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be greater than 0'),
];

export const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'])
    .withMessage('Status must be one of: PENDING, SHIPPING, DELIVERED, CANCELLED'),
];
