import pool from '../config/database.js';

const OrderItemModel = {
  async createMany(orderId, items, executor = pool) {
    const values = items.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.price_at_purchase,
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();

    await executor.execute(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ${placeholders}`,
      flatValues
    );
  },

  async findByOrderId(orderId, executor = pool) {
    const [rows] = await executor.execute(
      `SELECT oi.*, p.name AS product_name, p.description AS product_description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  },

  async findQuantitiesByOrderId(orderId, executor = pool) {
    const [rows] = await executor.execute(
      'SELECT product_id, SUM(quantity) AS quantity FROM order_items WHERE order_id = ? GROUP BY product_id',
      [orderId]
    );
    return rows;
  },
};

export default OrderItemModel;
