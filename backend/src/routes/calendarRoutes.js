const express = require('express');
const CalendarBlock = require('../models/CalendarBlock');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, calendarValidation } = require('../middleware/validator');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all blocks for a week
router.get('/week/:date', async (req, res, next) => {
  try {
    const { date } = req.params;
    const blocks = await CalendarBlock.findByUserAndWeek(req.user.id, date);
    res.json(blocks);
  } catch (error) {
    next(error);
  }
});

// Create new calendar block
router.post('/block', validate(calendarValidation.createBlock), async (req, res, next) => {
  try {
    console.log('Creating block with data:', JSON.stringify(req.body, null, 2));
    
    const blockData = {
      ...req.body,
      user_id: req.user.id
    };

    const block = await CalendarBlock.create(blockData);
    res.status(201).json(block);
  } catch (error) {
    console.error('Block creation error:', error);
    next(error);
  }
});

// Get single block
router.get('/block/:id', async (req, res, next) => {
  try {
    const block = await CalendarBlock.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    if (block.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(block);
  } catch (error) {
    next(error);
  }
});

// Update block
router.put('/block/:id', async (req, res, next) => {
  try {
    const block = await CalendarBlock.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    if (block.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await CalendarBlock.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Move block to new time
router.patch('/block/:id/move', async (req, res, next) => {
  try {
    const { start_time, end_time } = req.body;
    const block = await CalendarBlock.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    if (block.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await CalendarBlock.update(req.params.id, { start_time, end_time });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete block
router.delete('/block/:id', async (req, res, next) => {
  try {
    const block = await CalendarBlock.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    if (block.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await CalendarBlock.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Link workout to calendar block
router.post('/block/:id/link-workout', async (req, res, next) => {
  try {
    const { workout_id } = req.body;
    const block = await CalendarBlock.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    if (block.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await CalendarBlock.linkWorkout(req.params.id, workout_id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Unlink workout from calendar block
router.delete('/block/:id/link-workout', async (req, res, next) => {
  try {
    const block = await CalendarBlock.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    if (block.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await CalendarBlock.unlinkWorkout(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Get blocks with workout details for date range
router.get('/blocks-with-workouts', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const blocks = await CalendarBlock.findWithWorkouts(
      req.user.id,
      start_date,
      end_date
    );
    res.json(blocks);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
