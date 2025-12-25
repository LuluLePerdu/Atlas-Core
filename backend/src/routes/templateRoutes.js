const express = require('express');
const Template = require('../models/Template');
const CalendarBlock = require('../models/CalendarBlock');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Get all templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await Template.findByUser(req.user.id);
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Create template from current week
router.post('/', async (req, res, next) => {
  try {
    const { name, description, week_start_date, is_default } = req.body;

    if (!name || !week_start_date) {
      return res.status(400).json({ error: 'name and week_start_date are required' });
    }

    // Get blocks from the specified week
    const blocks = await CalendarBlock.findByUserAndWeek(req.user.id, week_start_date);

    const templateData = {
      user_id: req.user.id,
      name,
      description,
      blocks: blocks.map(block => ({
        type: block.type,
        title: block.title,
        day_of_week: block.day_of_week,
        start_time: block.start_time,
        end_time: block.end_time,
        linked_workout_id: block.linked_workout_id,
        linked_recipe_ids: block.linked_recipe_ids,
        notes: block.notes,
        color: block.color
      })),
      is_default: is_default || false
    };

    const template = await Template.create(templateData);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Get template by ID
router.get('/:id', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Update template
router.put('/:id', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await Template.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Set as default template
router.patch('/:id/default', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await Template.setDefault(req.user.id, req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Apply template to week
router.post('/:id/apply', async (req, res, next) => {
  try {
    const { week_start_date } = req.body;

    if (!week_start_date) {
      return res.status(400).json({ error: 'week_start_date is required' });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Create calendar blocks from template
    const createdBlocks = await Promise.all(
      template.blocks.map(block =>
        CalendarBlock.create({
          user_id: req.user.id,
          ...block,
          week_start_date
        })
      )
    );

    res.status(201).json({ blocks: createdBlocks });
  } catch (error) {
    next(error);
  }
});

// Delete template
router.delete('/:id', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Template.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
