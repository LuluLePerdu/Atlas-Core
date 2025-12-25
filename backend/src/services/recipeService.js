/**
 * Recipe Service
 * Handles recipe operations, meal prep calculations, and nutritional data
 */

/**
 * Estimate total meal prep time for multiple recipes
 * @param {Array} recipes - Array of recipe objects
 * @returns {Object} Time breakdown
 */
function estimateMealPrepTime(recipes) {
  let totalPrepTime = 0;
  const parallelTasks = {
    oven: [],
    stovetop: [],
    other: 0
  };

  recipes.forEach(recipe => {
    totalPrepTime += recipe.prep_time || 0;

    const cookTime = recipe.cook_time || 0;

    // Determine cooking method (would be better with explicit fields)
    if (recipe.tags && recipe.tags.includes('baked')) {
      parallelTasks.oven.push(cookTime);
    } else if (recipe.tags && recipe.tags.includes('stovetop')) {
      parallelTasks.stovetop.push(cookTime);
    } else {
      parallelTasks.other += cookTime;
    }
  });

  // Can use oven and stovetop simultaneously
  const parallelCookTime = Math.max(
    Math.max(...parallelTasks.oven, 0),
    Math.max(...parallelTasks.stovetop, 0)
  );

  const buffer = recipes.length * 5; // 5 min per recipe for transitions
  const totalTime = totalPrepTime + parallelCookTime + parallelTasks.other + buffer;

  return {
    total_prep_time: totalPrepTime,
    parallel_cook_time: parallelCookTime,
    sequential_cook_time: parallelTasks.other,
    buffer_time: buffer,
    estimated_total: totalTime
  };
}

/**
 * Calculate nutritional totals for a meal plan
 * @param {Array} meals - Array of meal objects with recipes
 * @param {Array} recipes - Array of recipe objects
 * @returns {Object} Nutritional breakdown
 */
function calculateNutrition(meals, recipes) {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };

  meals.forEach(meal => {
    const recipe = recipes.find(r => r.id === meal.recipe_id);
    if (!recipe || !recipe.macros_per_serving) return;

    const servings = meal.servings_needed || recipe.servings;
    const macros = recipe.macros_per_serving;

    totals.calories += (macros.calories || 0) * servings;
    totals.protein += (macros.protein || 0) * servings;
    totals.carbs += (macros.carbs || 0) * servings;
    totals.fat += (macros.fat || 0) * servings;
    totals.fiber += (macros.fiber || 0) * servings;
  });

  return totals;
}

/**
 * Suggest meal prep order based on cooking methods and times
 * @param {Array} recipes - Array of recipe objects
 * @returns {Array} Ordered recipe IDs with instructions
 */
function suggestPrepOrder(recipes) {
  const order = [];

  // Sort by cooking method priority
  const oven = recipes.filter(r => r.tags && r.tags.includes('baked'));
  const stovetop = recipes.filter(r => r.tags && r.tags.includes('stovetop'));
  const noCook = recipes.filter(r => !r.cook_time || r.cook_time === 0);
  const other = recipes.filter(r => 
    !oven.includes(r) && !stovetop.includes(r) && !noCook.includes(r)
  );

  // Start with longest cooking items
  oven.sort((a, b) => (b.cook_time || 0) - (a.cook_time || 0));
  stovetop.sort((a, b) => (b.cook_time || 0) - (a.cook_time || 0));

  if (oven.length > 0) {
    order.push({
      recipe_id: oven[0].id,
      instruction: 'Start this first - longest oven time',
      priority: 1
    });
  }

  if (stovetop.length > 0) {
    order.push({
      recipe_id: stovetop[0].id,
      instruction: 'Prepare while oven is heating',
      priority: 2
    });
  }

  // Add remaining recipes
  [...oven.slice(1), ...stovetop.slice(1), ...other, ...noCook].forEach((recipe, idx) => {
    order.push({
      recipe_id: recipe.id,
      instruction: 'Prepare in parallel or during cooking time',
      priority: idx + 3
    });
  });

  return order;
}

/**
 * Scale recipe servings
 * @param {Object} recipe - Recipe object
 * @param {number} targetServings - Desired servings
 * @returns {Object} Scaled recipe
 */
function scaleRecipe(recipe, targetServings) {
  const multiplier = targetServings / recipe.servings;

  return {
    ...recipe,
    servings: targetServings,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: ing.quantity * multiplier
    })),
    macros_per_serving: recipe.macros_per_serving // Macros per serving don't change
  };
}

module.exports = {
  estimateMealPrepTime,
  calculateNutrition,
  suggestPrepOrder,
  scaleRecipe
};
