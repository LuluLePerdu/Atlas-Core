const db = require('../config/database');

class GroceryList {
  static async create(groceryData) {
    const [list] = await db('grocery_lists')
      .insert({
        ...groceryData,
        generated_at: new Date()
      })
      .returning('*');
    return list;
  }

  static async findById(id) {
    return await db('grocery_lists').where({ id }).first();
  }

  static async findByUserAndWeek(userId, weekStartDate) {
    return await db('grocery_lists')
      .where({ user_id: userId, week_start_date: weekStartDate })
      .first();
  }

  static async update(id, updates) {
    const [list] = await db('grocery_lists')
      .where({ id })
      .update(updates)
      .returning('*');
    return list;
  }

  static async upsert(userId, weekStartDate, items, mealPlanId) {
    const existing = await this.findByUserAndWeek(userId, weekStartDate);

    if (existing) {
      return await this.update(existing.id, { items, meal_plan_id: mealPlanId });
    } else {
      return await this.create({
        user_id: userId,
        week_start_date: weekStartDate,
        meal_plan_id: mealPlanId,
        items
      });
    }
  }

  static async delete(id) {
    return await db('grocery_lists').where({ id }).del();
  }
}

module.exports = GroceryList;
