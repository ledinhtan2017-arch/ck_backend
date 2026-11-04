import { validationResult } from 'express-validator';
import ProductModel from '../models/product.model.js';
import ApiError from '../utils/apiError.js';

export const getAllProducts = async (req, res, next) => {
  try {
    // If admin, return all products including inactive
    if (req.user && req.user.role === 'admin') {
      const products = await ProductModel.findAllAdmin();
      return res.json({ success: true, data: products });
    }

    const products = await ProductModel.findAll();
    return res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Non-admin users can only see active products
    if (!product.is_active && (!req.user || req.user.role !== 'admin')) {
      throw ApiError.notFound('Product not found');
    }

    return res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, description, price, stock_quantity } = req.body;

    const product = await ProductModel.create({
      name,
      description: description || null,
      price,
      stock_quantity,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const { name, description, price, stock_quantity, is_active } = req.body;

    const updatedProduct = await ProductModel.update(req.params.id, {
      name,
      description,
      price,
      stock_quantity,
      is_active,
    });

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const { stock_quantity } = req.body;

    const updatedProduct = await ProductModel.updateStock(req.params.id, stock_quantity);

    return res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    await ProductModel.delete(req.params.id);

    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
