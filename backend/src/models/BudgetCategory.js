const db = require('../config/database')

class BudgetCategory {
  static async create(categoryData) {
    const [category] = await db('budget_categories')
      .insert({
        ...categoryData,
        created_at: db.fn.now()
      })
      .returning('*')
    return category
  }

  static async findById(id) {
    return db('budget_categories')
      .where({ id })
      .first()
  }

  static async findByUser(userId, type = null) {
    let query = db('budget_categories')
      .where({ user_id: userId })
      .orderBy('name')

    if (type) {
      query = query.where({ type })
    }

    return query
  }

  static async update(id, updates) {
    const [category] = await db('budget_categories')
      .where({ id })
      .update(updates)
      .returning('*')
    return category
  }

  static async delete(id) {
    return db('budget_categories')
      .where({ id })
      .del()
  }

  static async getOrCreateDefaults(userId) {
    const existing = await this.findByUser(userId)
    
    if (existing.length > 0) {
      return existing
    }

    const defaultCategories = [
      // Expenses
      { name: 'Groceries', type: 'expense', color: '#2ecc71', icon: 'ShoppingCart', is_default: true },
      { name: 'Rent', type: 'expense', color: '#e74c3c', icon: 'Home', is_default: true },
      { name: 'Utilities', type: 'expense', color: '#3498db', icon: 'Zap', is_default: true },
      { name: 'Transportation', type: 'expense', color: '#9b59b6', icon: 'Car', is_default: true },
      { name: 'Entertainment', type: 'expense', color: '#f39c12', icon: 'Film', is_default: true },
      { name: 'Healthcare', type: 'expense', color: '#1abc9c', icon: 'Heart', is_default: true },
      { name: 'Other', type: 'expense', color: '#95a5a6', icon: 'MoreHorizontal', is_default: true },
      // Income
      { name: 'Salary', type: 'income', color: '#27ae60', icon: 'DollarSign', is_default: true },
      { name: 'Freelance', type: 'income', color: '#16a085', icon: 'Briefcase', is_default: true },
      { name: 'Other Income', type: 'income', color: '#2ecc71', icon: 'TrendingUp', is_default: true }
    ]

    const categories = await Promise.all(
      defaultCategories.map(cat => 
        this.create({ ...cat, user_id: userId })
      )
    )

    return categories
  }
}

module.exports = BudgetCategory
