const db = require('../config/database');

class MealPlan {
  static async create(mealPlanData) {
    const [mealPlan] = await db('meal_plans')
      .insert({
        ...mealPlanData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return mealPlan;
  }

  static async findById(id) {
    return await db('meal_plans').where({ id }).first();
  }

  static async findByUserAndWeek(userId, weekStartDate) {
    return await db('meal_plans')
      .where({ user_id: userId, week_start_date: weekStartDate })
      .first();
  }

  static async update(id, updates) {
    const [mealPlan] = await db('meal_plans')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return mealPlan;
  }

  static async upsert(userId, weekStartDate, meals) {
    const existing = await this.findByUserAndWeek(userId, weekStartDate);

    if (existing) {
      return await this.update(existing.id, { meals });
    } else {
      return await this.create({
        user_id: userId,
        week_start_date: weekStartDate,
        meals
      });
    }
  }

  static async delete(id) {
    return await db('meal_plans').where({ id }).del();
  }
}

module.exports = MealPlan;
