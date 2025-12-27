const express = require('express');
const GroceryList = require('../models/GroceryList');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/authMiddleware');
const groceryGenerator = require('../services/groceryGenerator');

const router = express.Router();

router.use(authMiddleware);

// Get grocery list for a week
router.get('/week/:date', async (req, res, next) => {
  try {
    const { date } = req.params;
    const groceryList = await GroceryList.findByUserAndWeek(req.user.id, date);

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found for this week' });
    }

    res.json(groceryList);
  } catch (error) {
    next(error);
  }
});

// Generate grocery list from meal plan
router.post('/generate', async (req, res, next) => {
  try {
    const { week_start_date } = req.body;

    if (!week_start_date) {
      return res.status(400).json({ error: 'week_start_date is required' });
    }

    // Import CalendarBlock model
    const CalendarBlock = require('../models/CalendarBlock');

    // Get all blocks for this week
    const blocks = await CalendarBlock.findByUserAndWeek(req.user.id, week_start_date);

    // Filter only meal blocks that have recipes (either in recipe_id or linked_recipe_ids)
    const mealBlocks = blocks.filter(block => {
      if (block.type !== 'meal') return false;
      return block.recipe_id || (block.linked_recipe_ids && block.linked_recipe_ids.length > 0);
    });

    if (mealBlocks.length === 0) {
      return res.status(404).json({ error: 'No meals found for this week' });
    }

    // Fetch all recipes (from both recipe_id and linked_recipe_ids)
    const recipeIds = [...new Set(
      mealBlocks.flatMap(block => {
        const ids = [];
        if (block.recipe_id) ids.push(block.recipe_id);
        if (block.linked_recipe_ids) ids.push(...block.linked_recipe_ids);
        return ids;
      })
    )];
    const recipes = await Promise.all(
      recipeIds.map(id => Recipe.findById(id))
    );

    // Transform blocks to meal format for grocery generator
    const meals = mealBlocks.flatMap(block => {
      const blockRecipeIds = [];
      if (block.recipe_id) blockRecipeIds.push(block.recipe_id);
      if (block.linked_recipe_ids) blockRecipeIds.push(...block.linked_recipe_ids);
      
      return blockRecipeIds.map(recipeId => ({
        recipe_id: recipeId,
        day: block.day_of_week,
        servings_needed: 1 // Default to 1, can be customized later
      }));
    });

    // Generate grocery list
    const categorizedItems = groceryGenerator.generateGroceryList(meals, recipes);
    
    // Flatten the categorized structure into a simple array of items
    const items = categorizedItems.flatMap(category => category.items);

    const groceryList = await GroceryList.upsert(
      req.user.id,
      week_start_date,
      items,
      null // No meal_plan_id since we're using calendar_blocks
    );

    res.status(201).json(groceryList);
  } catch (error) {
    next(error);
  }
});

// Update grocery list
router.put('/:id', async (req, res, next) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    if (groceryList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await GroceryList.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Update grocery list (PATCH for partial updates)
router.patch('/:id', async (req, res, next) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    if (groceryList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await GroceryList.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Toggle item checked
router.patch('/:id/item/:idx', async (req, res, next) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    if (groceryList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const items = groceryList.items;
    const idx = parseInt(req.params.idx);

    if (idx < 0 || idx >= items.length) {
      return res.status(400).json({ error: 'Invalid item index' });
    }

    items[idx].checked = !items[idx].checked;

    const updated = await GroceryList.update(req.params.id, { items });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Add custom item
router.post('/:id/item', async (req, res, next) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    if (groceryList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const items = groceryList.items;
    items.push({
      ...req.body,
      checked: false,
      custom: true
    });

    const updated = await GroceryList.update(req.params.id, { items });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete item
router.delete('/:id/item/:idx', async (req, res, next) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    if (groceryList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const items = groceryList.items;
    const idx = parseInt(req.params.idx);

    if (idx < 0 || idx >= items.length) {
      return res.status(400).json({ error: 'Invalid item index' });
    }

    items.splice(idx, 1);

    const updated = await GroceryList.update(req.params.id, { items });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete grocery list
router.delete('/:id', async (req, res, next) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    if (groceryList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await GroceryList.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
