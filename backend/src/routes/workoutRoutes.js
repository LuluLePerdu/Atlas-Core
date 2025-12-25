const express = require('express');
const Workout = require('../models/Workout');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, workoutValidation } = require('../middleware/validator');

const router = express.Router();

router.use(authMiddleware);

// Get all workouts
router.get('/', async (req, res, next) => {
  try {
    const { program_type } = req.query;
    const filters = {};
    if (program_type) filters.program_type = program_type;

    const workouts = await Workout.findByUser(req.user.id, filters);
    res.json(workouts);
  } catch (error) {
    next(error);
  }
});

// Create new workout
router.post('/', validate(workoutValidation.create), async (req, res, next) => {
  try {
    const workoutData = {
      ...req.body,
      user_id: req.user.id
    };

    const workout = await Workout.create(workoutData);
    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
});

// Get workout by ID
router.get('/:id', async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(workout);
  } catch (error) {
    next(error);
  }
});

// Update workout
router.put('/:id', async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await Workout.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete workout
router.delete('/:id', async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Workout.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
