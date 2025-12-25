const db = require('../config/database')

class Transaction {
  static async create(transactionData) {
    const [transaction] = await db('transactions')
      .insert({
        ...transactionData,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*')
    return transaction
  }

  static async findById(id) {
    return db('transactions')
      .where({ id })
      .first()
  }

  static async findByUser(userId, filters = {}) {
    let query = db('transactions')
      .select('transactions.*', 'budget_categories.name as category_name', 'budget_categories.color as category_color')
      .leftJoin('budget_categories', 'transactions.category_id', 'budget_categories.id')
      .where('transactions.user_id', userId)
      .orderBy('transaction_date', 'desc')

    if (filters.type) {
      query = query.where('transactions.type', filters.type)
    }

    if (filters.category_id) {
      query = query.where('transactions.category_id', filters.category_id)
    }

    if (filters.start_date) {
      query = query.where('transaction_date', '>=', filters.start_date)
    }

    if (filters.end_date) {
      query = query.where('transaction_date', '<=', filters.end_date)
    }

    return query
  }

  static async findByMonth(userId, month, year) {
    return db('transactions')
      .select('transactions.*', 'budget_categories.name as category_name', 'budget_categories.color as category_color')
      .leftJoin('budget_categories', 'transactions.category_id', 'budget_categories.id')
      .where('transactions.user_id', userId)
      .whereRaw('EXTRACT(MONTH FROM transaction_date) = ?', [month])
      .whereRaw('EXTRACT(YEAR FROM transaction_date) = ?', [year])
      .orderBy('transaction_date', 'desc')
  }

  static async getSummaryByMonth(userId, month, year) {
    const results = await db('transactions')
      .select('type')
      .sum('amount as total')
      .where('user_id', userId)
      .whereRaw('EXTRACT(MONTH FROM transaction_date) = ?', [month])
      .whereRaw('EXTRACT(YEAR FROM transaction_date) = ?', [year])
      .groupBy('type')

    const summary = {
      income: 0,
      expense: 0,
      balance: 0
    }

    results.forEach(row => {
      summary[row.type] = parseFloat(row.total) || 0
    })

    summary.balance = summary.income - summary.expense

    return summary
  }

  static async getCategoryBreakdown(userId, month, year, type = 'expense') {
    return db('transactions')
      .select(
        'budget_categories.id as category_id',
        'budget_categories.name as category_name',
        'budget_categories.color as category_color'
      )
      .sum('transactions.amount as total')
      .count('transactions.id as count')
      .leftJoin('budget_categories', 'transactions.category_id', 'budget_categories.id')
      .where('transactions.user_id', userId)
      .where('transactions.type', type)
      .whereRaw('EXTRACT(MONTH FROM transaction_date) = ?', [month])
      .whereRaw('EXTRACT(YEAR FROM transaction_date) = ?', [year])
      .groupBy('budget_categories.id', 'budget_categories.name', 'budget_categories.color')
      .orderBy('total', 'desc')
  }

  static async update(id, updates) {
    const [transaction] = await db('transactions')
      .where({ id })
      .update({
        ...updates,
        updated_at: db.fn.now()
      })
      .returning('*')
    return transaction
  }

  static async delete(id) {
    return db('transactions')
      .where({ id })
      .del()
  }
}

module.exports = Transaction
