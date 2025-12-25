/**
 * Autopilot Service
 * Generates suggested weekly plans based on user history and patterns
 */

const CalendarBlock = require('../models/CalendarBlock');
const Recipe = require('../models/Recipe');
const MealPlan = require('../models/MealPlan');

/**
 * Analyze user's calendar history to identify patterns
 * @param {string} userId - User ID
 * @param {number} weeksBack - Number of weeks to analyze
 * @returns {Promise<Object>} Pattern analysis
 */
async function analyzeUserPatterns(userId, weeksBack = 4) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeksBack * 7));

  const blocks = await CalendarBlock.findByUserAndDateRange(
    userId,
    startDate.toISOString(),
    endDate.toISOString()
  );

  const patterns = {
    workDays: {},
    workoutFrequency: 0,
    workoutDays: {},
    preferredWorkoutTimes: [],
    sleepSchedule: { average_bedtime: null, average_wake_time: null },
    totalBlocks: blocks.length
  };

  // Analyze blocks
  blocks.forEach(block => {
    const day = block.day_of_week;

    if (block.type === 'work') {
      patterns.workDays[day] = (patterns.workDays[day] || 0) + 1;
    }

    if (block.type === 'workout') {
      patterns.workoutFrequency++;
      patterns.workoutDays[day] = (patterns.workoutDays[day] || 0) + 1;
      
      const hour = new Date(block.start_time).getHours();
      patterns.preferredWorkoutTimes.push(hour);
    }
  });

  // Calculate most common workout time
  if (patterns.preferredWorkoutTimes.length > 0) {
    const timeFrequency = {};
    patterns.preferredWorkoutTimes.forEach(time => {
      timeFrequency[time] = (timeFrequency[time] || 0) + 1;
    });
    patterns.mostCommonWorkoutTime = Object.keys(timeFrequency).reduce((a, b) =>
      timeFrequency[a] > timeFrequency[b] ? a : b
    );
  }

  return patterns;
}

/**
 * Find most used recipes
 * @param {string} userId - User ID
 * @param {number} limit - Number of recipes to return
 * @returns {Promise<Array>} Most used recipes
 */
async function findMostUsedRecipes(userId, limit = 5) {
  const recipes = await Recipe.findByUser(userId);
  
  // This is a simplified version - in production would query meal_plans
  // and count recipe usage
  return recipes.slice(0, limit);
}

/**
 * Generate autopilot week suggestion
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Suggested week plan
 */
async function generateAutopilotWeek(userId) {
  const patterns = await analyzeUserPatterns(userId);
  const commonRecipes = await findMostUsedRecipes(userId);

  const suggestedBlocks = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Add work blocks for common work days
  const workDays = Object.entries(patterns.workDays)
    .filter(([_, count]) => count >= 2) // Worked at least 2 times in last 4 weeks
    .map(([day]) => day);

  workDays.forEach(day => {
    suggestedBlocks.push({
      type: 'work',
      title: 'Work',
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
      color: '#34495e'
    });
  });

  // Add workout blocks
  const workoutDays = Object.entries(patterns.workoutDays)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => day);

  const workoutTime = patterns.mostCommonWorkoutTime || 7;
  workoutDays.forEach(day => {
    suggestedBlocks.push({
      type: 'workout',
      title: 'Workout',
      day_of_week: day,
      start_time: `${String(workoutTime).padStart(2, '0')}:00`,
      end_time: `${String(workoutTime + 1).padStart(2, '0')}:00`,
      color: '#e74c3c'
    });
  });

  // Suggest meal plan
  const suggestedMealPlan = {
    meals: commonRecipes.map((recipe, idx) => ({
      recipe_id: recipe.id,
      day: days[idx % 7],
      meal_type: 'dinner',
      servings_needed: recipe.servings
    }))
  };

  return {
    suggested_blocks: suggestedBlocks,
    suggested_meal_plan: suggestedMealPlan,
    confidence: calculateConfidence(patterns),
    based_on: {
      weeks_analyzed: 4,
      total_blocks: patterns.totalBlocks
    }
  };
}

/**
 * Calculate confidence score for suggestions
 * @param {Object} patterns - User patterns
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(patterns) {
  // More data = higher confidence
  const dataScore = Math.min(patterns.totalBlocks / 50, 1); // Max at 50 blocks
  
  // Consistency score
  const consistencyScore = patterns.workoutFrequency > 0 ? 0.5 : 0;

  return (dataScore * 0.7 + consistencyScore * 0.3);
}

module.exports = {
  analyzeUserPatterns,
  findMostUsedRecipes,
  generateAutopilotWeek,
  calculateConfidence
};
