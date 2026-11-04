import { validationResult } from 'express-validator';
import UserModel from '../models/user.model.js';
import ApiError from '../utils/apiError.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { full_name, phone } = req.body;

    const updatedUser = await UserModel.updateProfile(req.user.id, {
      full_name,
      phone,
    });

    if (!updatedUser) {
      throw ApiError.notFound('User not found');
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
