const express = require('express');
const WorkoutSession = require('../models/WorkoutSession');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Get all sessions for user
router.get('/', async (req, res, next) => {
  try {
    const { workout_id, completed, start_date, end_date } = req.query;
    const filters = {};

    if (workout_id) filters.workout_id = workout_id;
    if (completed !== undefined) filters.completed = completed === 'true';
    if (start_date && end_date) {
      filters.start_date = start_date;
      filters.end_date = end_date;
    }

    const sessions = await WorkoutSession.findByUser(req.user.id, filters);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Create new workout session
router.post('/', async (req, res, next) => {
  try {
    const sessionData = {
      ...req.body,
      user_id: req.user.id
    };

    const session = await WorkoutSession.create(sessionData);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

// Get single session
router.get('/:id', async (req, res, next) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Update session
router.put('/:id', async (req, res, next) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await WorkoutSession.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Mark session as completed with notes
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { exercises_completed, notes, duration_actual } = req.body;
    const session = await WorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await WorkoutSession.markCompleted(
      req.params.id,
      exercises_completed,
      notes,
      duration_actual
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Get sessions with workout details
router.get('/history/detailed', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const sessions = await WorkoutSession.getSessionsWithWorkouts(
      req.user.id,
      start_date,
      end_date
    );

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Get progress statistics
router.get('/stats/progress', async (req, res, next) => {
  try {
    const { workout_id } = req.query;
    const stats = await WorkoutSession.getProgressStats(req.user.id, workout_id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Delete session
router.delete('/:id', async (req, res, next) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await WorkoutSession.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
