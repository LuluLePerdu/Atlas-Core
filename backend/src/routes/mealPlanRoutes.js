const express = require('express');
const MealPlan = require('../models/MealPlan');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Get meal plan for a week
router.get('/week/:date', async (req, res, next) => {
  try {
    const { date } = req.params;
    const mealPlan = await MealPlan.findByUserAndWeek(req.user.id, date);

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found for this week' });
    }

    res.json(mealPlan);
  } catch (error) {
    next(error);
  }
});

// Create or update meal plan
router.post('/', async (req, res, next) => {
  try {
    const { week_start_date, meals } = req.body;

    if (!week_start_date || !meals) {
      return res.status(400).json({ error: 'week_start_date and meals are required' });
    }

    const mealPlan = await MealPlan.upsert(req.user.id, week_start_date, meals);
    res.status(201).json(mealPlan);
  } catch (error) {
    next(error);
  }
});

// Update meal plan
router.put('/:id', async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    if (mealPlan.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await MealPlan.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete meal plan
router.delete('/:id', async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    if (mealPlan.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await MealPlan.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
