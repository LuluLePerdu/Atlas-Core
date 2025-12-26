const express = require('express');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, recipeValidation } = require('../middleware/validator');
const nutritionService = require('../services/nutritionService');

const router = express.Router();

router.use(authMiddleware);

// Create custom ingredient
router.post('/ingredients', async (req, res, next) => {
  try {
    const { name, name_fr, name_en, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category } = req.body;

    const ingredient = await Ingredient.create({
      name,
      name_fr: name_fr || name,
      name_en: name_en || name,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      category: category || 'custom',
      source: 'user',
      user_id: req.user.id
    });

    res.status(201).json(ingredient);
  } catch (error) {
    next(error);
  }
});

// Search ingredients from database (NOT API - respects rate limits)
router.get('/search-ingredients', async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const results = await Ingredient.search(query, 10);
    
    // Format results for frontend
    const formattedResults = results.map(ing => ({
      name: ing.name_fr || ing.name,
      calories: parseFloat(ing.calories_per_100g),
      protein: parseFloat(ing.protein_per_100g),
      carbs: parseFloat(ing.carbs_per_100g),
      fat: parseFloat(ing.fat_per_100g),
      category: ing.category,
      source: ing.source
    }));

    res.json(formattedResults);
  } catch (error) {
    next(error);
  }
});

// Calculate nutrition for ingredients
router.post('/calculate-nutrition', async (req, res, next) => {
  try {
    const { ingredients, servings } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    const nutrition = await nutritionService.calculateRecipeNutrition(
      ingredients,
      servings || 1
    );

    res.json(nutrition);
  } catch (error) {
    next(error);
  }
});

// Get all recipes (user recipes + public recipes)
router.get('/', async (req, res, next) => {
  try {
    const { tags, difficulty } = req.query;
    const filters = {};

    if (tags) filters.tags = tags.split(',');
    if (difficulty) filters.difficulty = difficulty;

    // Get user's own recipes
    const userRecipes = await Recipe.findByUser(req.user.id, filters);
    
    // Get public recipes
    const publicRecipes = await Recipe.findPublic(filters);
    
    // Combine and deduplicate
    const allRecipes = [...userRecipes];
    const userRecipeIds = new Set(userRecipes.map(r => r.id));
    
    for (const recipe of publicRecipes) {
      if (!userRecipeIds.has(recipe.id)) {
        allRecipes.push(recipe);
      }
    }
    
    res.json(allRecipes);
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
