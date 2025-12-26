const express = require('express')
const Transaction = require('../models/Transaction')
const BudgetCategory = require('../models/BudgetCategory')
const MonthlyBudget = require('../models/MonthlyBudget')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

// Get categories
router.get('/categories', async (req, res, next) => {
  try {
    const { type } = req.query
    const categories = await BudgetCategory.findByUser(req.user.id, type)
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

// Create category
router.post('/categories', async (req, res, next) => {
  try {
    const categoryData = {
      ...req.body,
      user_id: req.user.id
    }
    const category = await BudgetCategory.create(categoryData)
    res.status(201).json(category)
  } catch (error) {
    next(error)
  }
})

// Initialize default categories
router.post('/categories/defaults', async (req, res, next) => {
  try {
    const categories = await BudgetCategory.getOrCreateDefaults(req.user.id)
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

// Update category
router.put('/categories/:id', async (req, res, next) => {
  try {
    const category = await BudgetCategory.findById(req.params.id)
    if (!category || category.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Category not found' })
    }
    const updated = await BudgetCategory.update(req.params.id, req.body)
    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Delete category
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await BudgetCategory.findById(req.params.id)
    if (!category || category.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Category not found' })
    }
    await BudgetCategory.delete(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Get transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const { type, category_id, start_date, end_date } = req.query
    const filters = { type, category_id, start_date, end_date }
    const transactions = await Transaction.findByUser(req.user.id, filters)
    res.json(transactions)
  } catch (error) {
    next(error)
  }
})

// Get transactions by month
router.get('/transactions/month/:year/:month', async (req, res, next) => {
  try {
    const { year, month } = req.params
    const transactions = await Transaction.findByMonth(req.user.id, parseInt(month), parseInt(year))
    res.json(transactions)
  } catch (error) {
    next(error)
  }
})

// Get category breakdown for a month
router.get('/transactions/breakdown/:year/:month', async (req, res, next) => {
  try {
    const { year, month } = req.params
    const categoryBreakdown = await Transaction.getCategoryBreakdown(req.user.id, parseInt(month), parseInt(year))
    res.json(categoryBreakdown)
  } catch (error) {
    next(error)
  }
})

// Get monthly summary
router.get('/summary/:year/:month', async (req, res, next) => {
  try {
    const { year, month } = req.params
    const summary = await Transaction.getSummaryByMonth(req.user.id, parseInt(month), parseInt(year))
    const categoryBreakdown = await Transaction.getCategoryBreakdown(req.user.id, parseInt(month), parseInt(year))
    
    res.json({
      ...summary,
      categories: categoryBreakdown
    })
  } catch (error) {
    next(error)
  }
})

// Create transaction
router.post('/transactions', async (req, res, next) => {
  try {
    const transactionData = {
      ...req.body,
      user_id: req.user.id
    }
    const transaction = await Transaction.create(transactionData)
    res.status(201).json(transaction)
  } catch (error) {
    next(error)
  }
})

// Update transaction
router.put('/transactions/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction || transaction.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    const updated = await Transaction.update(req.params.id, req.body)
    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Delete transaction
router.delete('/transactions/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction || transaction.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    await Transaction.delete(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Get monthly budgets
router.get('/budgets/:year/:month', async (req, res, next) => {
  try {
    const { year, month } = req.params
    const budgets = await MonthlyBudget.findByMonth(req.user.id, parseInt(month), parseInt(year))
    res.json(budgets)
  } catch (error) {
    next(error)
  }
})

// Set monthly budget
router.post('/budgets', async (req, res, next) => {
  try {
    const { category_id, month, year, budget_amount } = req.body
    const budget = await MonthlyBudget.upsert(req.user.id, category_id, month, year, budget_amount)
    res.json(budget)
  } catch (error) {
    next(error)
  }
})

module.exports = router
