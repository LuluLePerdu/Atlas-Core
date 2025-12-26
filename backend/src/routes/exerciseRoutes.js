const express = require('express');
const Exercise = require('../models/Exercise');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Get all exercises (user's + public)
router.get('/', async (req, res, next) => {
  try {
    const { category, muscle_groups } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (muscle_groups) filters.muscle_groups = muscle_groups.split(',');

    // Get both user's exercises and public exercises
    const userExercises = await Exercise.findByUser(req.user.id, filters);
    const publicExercises = await Exercise.findPublic(filters);
    
    // Combine and deduplicate (in case user created same exercise)
    const allExercises = [...userExercises, ...publicExercises];
    const uniqueExercises = allExercises.filter((exercise, index, self) =>
      index === self.findIndex((e) => e.id === exercise.id)
    );
    
    res.json(uniqueExercises);
  } catch (error) {
    next(error);
  }
});

// Get public exercises
router.get('/public', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filters = {};
    if (category) filters.category = category;

    const exercises = await Exercise.findPublic(filters);
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

// Create new exercise
router.post('/', async (req, res, next) => {
  try {
    const exerciseData = {
      ...req.body,
      user_id: req.user.id
    };

    const exercise = await Exercise.create(exerciseData);
    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
});

// Get exercise by ID
router.get('/:id', async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    if (exercise.user_id !== req.user.id && !exercise.is_public) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

// Update exercise
router.put('/:id', async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    if (exercise.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await Exercise.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete exercise
router.delete('/:id', async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    if (exercise.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Exercise.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
