const db = require('../config/database');

class GroceryList {
  static async create(groceryData) {
    const [list] = await db('grocery_lists')
      .insert({
        ...groceryData,
        items: JSON.stringify(groceryData.items),
        generated_at: new Date()
      })
      .returning('*');
    
    // Parse items back to object for return
    return {
      ...list,
      items: typeof list.items === 'string' ? JSON.parse(list.items) : list.items
    };
  }

  static async findById(id) {
    const list = await db('grocery_lists').where({ id }).first();
    if (list && typeof list.items === 'string') {
      list.items = JSON.parse(list.items);
    }
    return list;
  }

  static async findByUserAndWeek(userId, weekStartDate) {
    const list = await db('grocery_lists')
      .where({ user_id: userId, week_start_date: weekStartDate })
      .first();
    if (list && typeof list.items === 'string') {
      list.items = JSON.parse(list.items);
    }
    return list;
  }

  static async update(id, updates) {
    const updateData = { ...updates };
    if (updateData.items) {
      updateData.items = JSON.stringify(updateData.items);
    }
    
    const [list] = await db('grocery_lists')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    // Parse items back to object for return
    return {
      ...list,
      items: typeof list.items === 'string' ? JSON.parse(list.items) : list.items
    };
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
