import pool from '../config/database.js';

const ProductModel = {
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    return rows;
  },

  async findAllAdmin() {
    const [rows] = await pool.execute(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByIdForUpdate(id, executor) {
    const [rows] = await executor.execute(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, description = null, price, stock_quantity = 0 }) {
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, stock_quantity) VALUES (?, ?, ?, ?)',
      [name, description, price, stock_quantity]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'description', 'price', 'stock_quantity', 'is_active'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  async updateStock(id, quantity) {
    await pool.execute(
      'UPDATE products SET stock_quantity = ? WHERE id = ?',
      [quantity, id]
    );
    return this.findById(id);
  },

  async decrementStock(id, quantity, executor) {
    await executor.execute(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [quantity, id]
    );
  },

  async incrementStock(id, quantity, executor) {
    await executor.execute(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [quantity, id]
    );
  },

  async delete(id) {
    await pool.execute(
      'UPDATE products SET is_active = FALSE WHERE id = ?',
      [id]
    );
  },
};

export default ProductModel;
