import pool from '../config/database.js';

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, full_name, email, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ full_name, email, password, phone = null, role = 'user' }) {
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, password, phone, role]
    );
    return { id: result.insertId, full_name, email, phone, role };
  },

  async updateProfile(id, { full_name, phone }) {
    const fields = [];
    const values = [];

    if (full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(full_name);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },
};

export default UserModel;
