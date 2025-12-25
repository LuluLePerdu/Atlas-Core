const db = require('../config/database');

class User {
  static async create({ email, password_hash, username }) {
    const [user] = await db('users')
      .insert({
        email,
        password_hash,
        username,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return user;
  }

  static async findById(id) {
    return await db('users').where({ id }).first();
  }

  static async findByEmail(email) {
    return await db('users').where({ email }).first();
  }

  static async findByUsername(username) {
    return await db('users').where({ username }).first();
  }

  static async update(id, updates) {
    const [user] = await db('users')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return user;
  }

  static async delete(id) {
    return await db('users').where({ id }).del();
  }
}

module.exports = User;
