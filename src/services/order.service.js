import pool from '../config/database.js';
import OrderItemModel from '../models/orderItem.model.js';
import OrderModel from '../models/order.model.js';
import ProductModel from '../models/product.model.js';
import ApiError from '../utils/apiError.js';

const OrderService = {
  async createOrder({ userId, shipping_address, recipient_phone, note, items }) {
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const quantitiesByProduct = new Map();
      for (const item of items) {
        const productId = Number(item.product_id);
        quantitiesByProduct.set(
          productId,
          (quantitiesByProduct.get(productId) || 0) + Number(item.quantity)
        );
      }

      const consolidatedItems = Array.from(
        quantitiesByProduct,
        ([product_id, quantity]) => ({ product_id, quantity })
      ).sort((a, b) => a.product_id - b.product_id);

      let totalAmount = 0;
      const orderItems = [];

      for (const item of consolidatedItems) {
        const product = await ProductModel.findByIdForUpdate(item.product_id, connection);

        if (!product) {
          throw ApiError.badRequest(`Product with ID ${item.product_id} not found`);
        }

        if (!product.is_active) {
          throw ApiError.badRequest(`Product "${product.name}" is not available`);
        }

        if (product.stock_quantity < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`
          );
        }

        totalAmount += parseFloat(product.price) * item.quantity;
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: product.price,
        });
      }

      const order = await OrderModel.create({
        user_id: userId,
        total_amount: totalAmount,
        shipping_address,
        recipient_phone,
        note: note || null,
      }, connection);

      await OrderItemModel.createMany(order.id, orderItems, connection);

      for (const item of consolidatedItems) {
        await ProductModel.decrementStock(item.product_id, item.quantity, connection);
      }

      await connection.commit();
      transactionStarted = false;

      return {
        ...order,
        items: await OrderItemModel.findByOrderId(order.id),
      };
    } catch (error) {
      if (transactionStarted) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  getMyOrders(userId) {
    return OrderModel.findByUserId(userId);
  },

  async getMyOrderById(id, userId) {
    const order = await OrderModel.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.user_id !== userId) {
      throw ApiError.forbidden('You do not have permission to view this order');
    }

    return {
      ...order,
      items: await OrderItemModel.findByOrderId(order.id),
    };
  },

  getAllOrders() {
    return OrderModel.findAll();
  },

  async getOrderById(id) {
    const order = await OrderModel.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return {
      ...order,
      items: await OrderItemModel.findByOrderId(order.id),
    };
  },

  async updateOrderStatus(id, status) {
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const order = await OrderModel.findByIdForUpdate(id, connection);
      if (!order) {
        throw ApiError.notFound('Order not found');
      }

      const currentStatus = order.status;
      if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
        throw ApiError.badRequest(
          `Cannot change status of an order that is already ${currentStatus}`
        );
      }

      if (currentStatus === 'PENDING' && !['SHIPPING', 'CANCELLED'].includes(status)) {
        throw ApiError.badRequest(
          'PENDING orders can only transition to SHIPPING or CANCELLED'
        );
      }

      if (currentStatus === 'SHIPPING' && status !== 'DELIVERED') {
        throw ApiError.badRequest(
          'SHIPPING orders can only transition to DELIVERED'
        );
      }

      if (currentStatus === 'PENDING' && status === 'CANCELLED') {
        const orderItems = await OrderItemModel.findQuantitiesByOrderId(id, connection);
        for (const item of orderItems) {
          await ProductModel.incrementStock(item.product_id, item.quantity, connection);
        }
      }

      const updatedOrder = await OrderModel.updateStatus(id, status, connection);
      await connection.commit();
      transactionStarted = false;

      return updatedOrder;
    } catch (error) {
      if (transactionStarted) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  },
};

export default OrderService;
