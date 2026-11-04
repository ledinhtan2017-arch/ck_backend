import pool from '../config/database.js';

const OrderModel = {
  async create(
    { user_id, total_amount, shipping_address, recipient_phone, note = null },
    executor = pool
  ) {
    const [result] = await executor.execute(
      'INSERT INTO orders (user_id, total_amount, shipping_address, recipient_phone, note) VALUES (?, ?, ?, ?, ?)',
      [user_id, total_amount, shipping_address, recipient_phone, note]
    );
    return this.findById(result.insertId, executor);
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async findById(id, executor = pool) {
    const [rows] = await executor.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await pool.execute(
      'SELECT o.*, u.full_name AS user_name, u.email AS user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );
    return rows;
  },

  async findByIdForUpdate(id, executor) {
    const [rows] = await executor.execute(
      'SELECT * FROM orders WHERE id = ? FOR UPDATE',
      [id]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status, executor = pool) {
    await executor.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id, executor);
  },
};

export default OrderModel;
