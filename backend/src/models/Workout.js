const db = require('../config/database');

class Workout {
  static async create(workoutData) {
    // Clean exercises data - remove empty string values
    const exercises = (workoutData.exercises || []).map(exercise => {
      const cleaned = { ...exercise };
      // Remove empty strings
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') {
          delete cleaned[key];
        }
      });
      return cleaned;
    });

    // Use db.raw to properly handle json/jsonb type
    const [workout] = await db('workouts')
      .insert({
        ...workoutData,
        exercises: db.raw('?::jsonb', [JSON.stringify(exercises)]),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    // Parse exercises back to object for response
    if (workout.exercises && typeof workout.exercises === 'string') {
      workout.exercises = JSON.parse(workout.exercises);
    }
    
    return workout;
  }

  static async findById(id) {
    const workout = await db('workouts').where({ id }).first();
    return workout;
  }

  static async findByUser(userId, filters = {}) {
    let query = db('workouts').where({ user_id: userId });

    if (filters.program_type) {
      query = query.where({ program_type: filters.program_type });
    }

    const workouts = await query.orderBy('created_at', 'desc');
    return workouts;
  }

  static async update(id, updates) {
    const updateData = { ...updates, updated_at: new Date() };
    
    // Clean exercises if present
    if (updateData.exercises) {
      const exercises = updateData.exercises.map(exercise => {
        const cleaned = { ...exercise };
        // Remove empty strings
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key] === '') {
            delete cleaned[key];
          }
        });
        return cleaned;
      });
      updateData.exercises = db.raw('?::jsonb', [JSON.stringify(exercises)]);
    }
    
    const [workout] = await db('workouts')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    // Parse exercises back to object for response
    if (workout && workout.exercises && typeof workout.exercises === 'string') {
      workout.exercises = JSON.parse(workout.exercises);
    }
    
    return workout;
  }

  static async delete(id) {
    return await db('workouts').where({ id }).del();
  }
}

module.exports = Workout;
