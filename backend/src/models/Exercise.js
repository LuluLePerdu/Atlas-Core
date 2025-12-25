const db = require('../config/database');

class Exercise {
  static async create(exerciseData) {
    const [exercise] = await db('exercises')
      .insert({
        ...exerciseData,
        created_at: new Date()
      })
      .returning('*');
    return exercise;
  }

  static async findById(id) {
    return await db('exercises').where({ id }).first();
  }

  static async findByUser(userId, filters = {}) {
    let query = db('exercises').where({ user_id: userId });

    if (filters.category) {
      query = query.where({ category: filters.category });
    }

    if (filters.muscle_groups) {
      query = query.whereRaw('muscle_groups && ?', [filters.muscle_groups]);
    }

    return await query.orderBy('name');
  }

  static async update(id, updates) {
    const [exercise] = await db('exercises')
      .where({ id })
      .update(updates)
      .returning('*');
    return exercise;
  }

  static async delete(id) {
    return await db('exercises').where({ id }).del();
  }

  static async findPublic(filters = {}) {
    let query = db('exercises').where({ is_public: true });

    if (filters.category) {
      query = query.where({ category: filters.category });
    }

    return await query.orderBy('name');
  }
}

module.exports = Exercise;
