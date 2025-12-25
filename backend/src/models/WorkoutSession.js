const db = require('../config/database');

class WorkoutSession {
  static async create(sessionData) {
    const [session] = await db('workout_sessions')
      .insert({
        ...sessionData,
        created_at: new Date()
      })
      .returning('*');
    return session;
  }

  static async findById(id) {
    return await db('workout_sessions')
      .where({ id })
      .first();
  }

  static async findByUser(userId, filters = {}) {
    let query = db('workout_sessions')
      .where({ user_id: userId })
      .orderBy('date', 'desc');

    if (filters.workout_id) {
      query = query.where({ workout_id: filters.workout_id });
    }

    if (filters.completed !== undefined) {
      query = query.where({ completed: filters.completed });
    }

    if (filters.start_date && filters.end_date) {
      query = query.whereBetween('date', [filters.start_date, filters.end_date]);
    }

    return await query;
  }

  static async update(id, updates) {
    const [session] = await db('workout_sessions')
      .where({ id })
      .update(updates)
      .returning('*');
    return session;
  }

  static async delete(id) {
    return await db('workout_sessions')
      .where({ id })
      .del();
  }

  static async markCompleted(id, exercisesCompleted, notes = null, durationActual = null) {
    const [session] = await db('workout_sessions')
      .where({ id })
      .update({
        completed: true,
        exercises_completed: JSON.stringify(exercisesCompleted),
        notes,
        duration_actual: durationActual
      })
      .returning('*');
    return session;
  }

  static async getSessionsWithWorkouts(userId, startDate, endDate) {
    return await db('workout_sessions as ws')
      .leftJoin('workouts as w', 'ws.workout_id', 'w.id')
      .where({ 'ws.user_id': userId })
      .whereBetween('ws.date', [startDate, endDate])
      .select(
        'ws.*',
        'w.name as workout_name',
        'w.program_type',
        'w.exercises as workout_exercises',
        'w.estimated_duration'
      )
      .orderBy('ws.date', 'desc');
  }

  static async getProgressStats(userId, workoutId = null) {
    let query = db('workout_sessions')
      .where({ user_id: userId, completed: true });

    if (workoutId) {
      query = query.where({ workout_id: workoutId });
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_sessions'),
        db.raw('AVG(duration_actual) as avg_duration'),
        db.raw('MAX(date) as last_session_date')
      )
      .first();

    return stats;
  }
}

module.exports = WorkoutSession;
