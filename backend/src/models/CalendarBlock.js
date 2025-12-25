const db = require('../config/database');

class CalendarBlock {
  static async create(blockData) {
    const [block] = await db('calendar_blocks')
      .insert({
        ...blockData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return block;
  }

  static async findById(id) {
    return await db('calendar_blocks').where({ id }).first();
  }

  static async findByUserAndWeek(userId, weekStartDate) {
    return await db('calendar_blocks')
      .where({ user_id: userId, week_start_date: weekStartDate })
      .orderBy('start_time');
  }

  static async update(id, updates) {
    const [block] = await db('calendar_blocks')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return block;
  }

  static async delete(id) {
    return await db('calendar_blocks').where({ id }).del();
  }

  static async findByUserAndDateRange(userId, startDate, endDate) {
    return await db('calendar_blocks')
      .where({ user_id: userId })
      .whereBetween('start_time', [startDate, endDate])
      .orderBy('start_time');
  }

  static async linkWorkout(blockId, workoutId) {
    const [block] = await db('calendar_blocks')
      .where({ id: blockId })
      .update({
        linked_workout_id: workoutId,
        updated_at: new Date()
      })
      .returning('*');
    return block;
  }

  static async unlinkWorkout(blockId) {
    const [block] = await db('calendar_blocks')
      .where({ id: blockId })
      .update({
        linked_workout_id: null,
        updated_at: new Date()
      })
      .returning('*');
    return block;
  }

  static async findWithWorkouts(userId, startDate, endDate) {
    return await db('calendar_blocks as cb')
      .leftJoin('workouts as w', 'cb.linked_workout_id', 'w.id')
      .where({ 'cb.user_id': userId })
      .whereBetween('cb.start_time', [startDate, endDate])
      .select(
        'cb.*',
        'w.name as workout_name',
        'w.exercises as workout_exercises',
        'w.estimated_duration as workout_duration'
      )
      .orderBy('cb.start_time');
  }
}

module.exports = CalendarBlock;
