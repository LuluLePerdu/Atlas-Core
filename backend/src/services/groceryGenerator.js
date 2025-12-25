/**
 * Grocery List Generator Service
 * Aggregates ingredients from multiple recipes and generates a categorized shopping list
 */

const CATEGORY_ORDER = [
  'produce',
  'meat',
  'dairy',
  'pantry',
  'frozen',
  'bakery',
  'beverages',
  'other'
];

/**
 * Generate grocery list from meal plan
 * @param {Array} meals - Array of meal objects with recipe_id and servings_needed
 * @param {Array} recipes - Array of recipe objects
 * @returns {Array} Categorized and aggregated grocery items
 */
function generateGroceryList(meals, recipes) {
  const ingredients = {};

  // Aggregate ingredients from all meals
  meals.forEach(meal => {
    const recipe = recipes.find(r => r.id === meal.recipe_id);
    if (!recipe) return;

    const multiplier = meal.servings_needed / recipe.servings;

    recipe.ingredients.forEach(ingredient => {
      const key = ingredient.name.toLowerCase().trim();
      const quantity = parseQuantity(ingredient.quantity) * multiplier;
      const category = ingredient.category || 'other';

      if (ingredients[key]) {
        // Aggregate quantities
        if (ingredients[key].unit === ingredient.unit) {
          ingredients[key].quantity += quantity;
        } else {
          // Different units - keep separate
          ingredients[key].alternativeUnits = ingredients[key].alternativeUnits || [];
          ingredients[key].alternativeUnits.push({
            quantity,
            unit: ingredient.unit
          });
        }
        ingredients[key].source_recipes.push(meal.recipe_id);
      } else {
        ingredients[key] = {
          name: ingredient.name,
          quantity,
          unit: ingredient.unit,
          category,
          source_recipes: [meal.recipe_id],
          checked: false
        };
      }
    });
  });

  return groupByCategory(Object.values(ingredients));
}

/**
 * Parse quantity string to number
 * @param {string|number} quantity
 * @returns {number}
 */
function parseQuantity(quantity) {
  if (typeof quantity === 'number') return quantity;

  // Handle fractions
  if (quantity.includes('/')) {
    const parts = quantity.split('/');
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }

  // Handle mixed numbers (e.g., "1 1/2")
  if (quantity.includes(' ')) {
    const parts = quantity.split(' ');
    const whole = parseFloat(parts[0]);
    if (parts[1].includes('/')) {
      const fraction = parts[1].split('/');
      return whole + parseFloat(fraction[0]) / parseFloat(fraction[1]);
    }
  }

  return parseFloat(quantity) || 1;
}

/**
 * Group ingredients by category
 * @param {Array} ingredients
 * @returns {Array} Categorized items
 */
function groupByCategory(ingredients) {
  const categorized = {};

  ingredients.forEach(item => {
    const category = item.category || 'other';
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(item);
  });

  // Sort by category order and alphabetically within categories
  const result = [];
  CATEGORY_ORDER.forEach(category => {
    if (categorized[category]) {
      result.push({
        category,
        items: categorized[category].sort((a, b) => a.name.localeCompare(b.name))
      });
    }
  });

  // Add any remaining categories not in the predefined order
  Object.keys(categorized).forEach(category => {
    if (!CATEGORY_ORDER.includes(category)) {
      result.push({
        category,
        items: categorized[category].sort((a, b) => a.name.localeCompare(b.name))
      });
    }
  });

  return result;
}

/**
 * Estimate total grocery cost
 * @param {Array} items - Grocery items
 * @returns {number} Estimated total cost
 */
function estimateCost(items) {
  // This would integrate with a price database or API
  // For now, returning 0 as placeholder
  return 0;
}

module.exports = {
  generateGroceryList,
  parseQuantity,
  groupByCategory,
  estimateCost
};
