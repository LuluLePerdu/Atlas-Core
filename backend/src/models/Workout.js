const db = require('../config/database');

class Workout {
  static async create(workoutData) {
    const [workout] = await db('workouts')
      .insert({
        ...workoutData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return workout;
  }

  static async findById(id) {
    return await db('workouts').where({ id }).first();
  }

  static async findByUser(userId, filters = {}) {
    let query = db('workouts').where({ user_id: userId });

    if (filters.program_type) {
      query = query.where({ program_type: filters.program_type });
    }

    return await query.orderBy('created_at', 'desc');
  }

  static async update(id, updates) {
    const [workout] = await db('workouts')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return workout;
  }

  static async delete(id) {
    return await db('workouts').where({ id }).del();
  }
}

module.exports = Workout;
