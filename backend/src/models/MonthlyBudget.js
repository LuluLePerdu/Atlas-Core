const db = require('../config/database')

class MonthlyBudget {
  static async upsert(userId, categoryId, month, year, budgetAmount) {
    const existing = await db('monthly_budgets')
      .where({ user_id: userId, category_id: categoryId, month, year })
      .first()

    if (existing) {
      const [budget] = await db('monthly_budgets')
        .where({ id: existing.id })
        .update({
          budget_amount: budgetAmount,
          updated_at: db.fn.now()
        })
        .returning('*')
      return budget
    }

    const [budget] = await db('monthly_budgets')
      .insert({
        user_id: userId,
        category_id: categoryId,
        month,
        year,
        budget_amount: budgetAmount,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*')
    return budget
  }

  static async findByMonth(userId, month, year) {
    return db('monthly_budgets')
      .select('monthly_budgets.*', 'budget_categories.name', 'budget_categories.color', 'budget_categories.type')
      .join('budget_categories', 'monthly_budgets.category_id', 'budget_categories.id')
      .where('monthly_budgets.user_id', userId)
      .where({ month, year })
      .orderBy('budget_categories.name')
  }

  static async delete(id) {
    return db('monthly_budgets')
      .where({ id })
      .del()
  }
}

module.exports = MonthlyBudget
