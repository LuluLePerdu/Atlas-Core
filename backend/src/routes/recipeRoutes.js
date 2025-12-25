const express = require('express');
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, recipeValidation } = require('../middleware/validator');

const router = express.Router();

router.use(authMiddleware);

// Get all recipes
router.get('/', async (req, res, next) => {
  try {
    const { tags, difficulty } = req.query;
    const filters = {};

    if (tags) filters.tags = tags.split(',');
    if (difficulty) filters.difficulty = difficulty;

    const recipes = await Recipe.findByUser(req.user.id, filters);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Get public recipes
router.get('/public', async (req, res, next) => {
  try {
    const { tags } = req.query;
    const filters = {};
    if (tags) filters.tags = tags.split(',');

    const recipes = await Recipe.findPublic(filters);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Create new recipe
router.post('/', validate(recipeValidation.create), async (req, res, next) => {
  try {
    const recipeData = {
      ...req.body,
      user_id: req.user.id
    };

    const recipe = await Recipe.create(recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

// Get recipe by ID
router.get('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipe.user_id !== req.user.id && !recipe.is_public) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Update recipe
router.put('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await Recipe.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete recipe
router.delete('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Recipe.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
