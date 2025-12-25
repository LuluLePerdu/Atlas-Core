/**
 * Workout Service
 * Handles workout scheduling, progression, and program suggestions
 */

const CalendarBlock = require('../models/CalendarBlock');
const Workout = require('../models/Workout');

const PROGRAM_TYPES = {
  PPL: { name: 'Push/Pull/Legs', frequency: 3, rest_days: 1 },
  UPPER_LOWER: { name: 'Upper/Lower Split', frequency: 4, rest_days: 1 },
  FULL_BODY: { name: 'Full Body', frequency: 3, rest_days: 1 },
  BRO_SPLIT: { name: 'Bro Split', frequency: 5, rest_days: 2 }
};

/**
 * Suggest workout days based on program type
 * @param {string} programType - Type of workout program
 * @param {string} weekStartDate - Start date of the week
 * @returns {Array} Suggested workout days
 */
function suggestWorkoutDays(programType, weekStartDate) {
  const program = PROGRAM_TYPES[programType];
  if (!program) return [];

  const suggestions = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (programType === 'PPL') {
    suggestions.push(
      { day: 'monday', workout_type: 'Push', color: '#e74c3c' },
      { day: 'wednesday', workout_type: 'Pull', color: '#3498db' },
      { day: 'friday', workout_type: 'Legs', color: '#2ecc71' }
    );
  } else if (programType === 'UPPER_LOWER') {
    suggestions.push(
      { day: 'monday', workout_type: 'Upper', color: '#e74c3c' },
      { day: 'tuesday', workout_type: 'Lower', color: '#2ecc71' },
      { day: 'thursday', workout_type: 'Upper', color: '#e74c3c' },
      { day: 'friday', workout_type: 'Lower', color: '#2ecc71' }
    );
  } else if (programType === 'FULL_BODY') {
    suggestions.push(
      { day: 'monday', workout_type: 'Full Body', color: '#9b59b6' },
      { day: 'wednesday', workout_type: 'Full Body', color: '#9b59b6' },
      { day: 'friday', workout_type: 'Full Body', color: '#9b59b6' }
    );
  } else if (programType === 'BRO_SPLIT') {
    suggestions.push(
      { day: 'monday', workout_type: 'Chest', color: '#e74c3c' },
      { day: 'tuesday', workout_type: 'Back', color: '#3498db' },
      { day: 'wednesday', workout_type: 'Shoulders', color: '#f39c12' },
      { day: 'thursday', workout_type: 'Legs', color: '#2ecc71' },
      { day: 'friday', workout_type: 'Arms', color: '#9b59b6' }
    );
  }

  return suggestions;
}

/**
 * Calculate workout volume and intensity
 * @param {Object} workout - Workout object
 * @returns {Object} Volume metrics
 */
function calculateWorkoutVolume(workout) {
  let totalSets = 0;
  let totalReps = 0;
  let estimatedDuration = 0;

  workout.exercises.forEach(exercise => {
    totalSets += exercise.sets || 0;
    totalReps += (exercise.sets || 0) * (exercise.reps || 0);
    estimatedDuration += (exercise.sets || 0) * 3; // ~3 minutes per set
  });

  return {
    total_sets: totalSets,
    total_reps: totalReps,
    estimated_duration: estimatedDuration
  };
}

/**
 * Check for workout conflicts in calendar
 * @param {string} userId - User ID
 * @param {string} day - Day of the week
 * @param {string} weekStartDate - Week start date
 * @returns {Promise<boolean>} True if conflict exists
 */
async function checkWorkoutConflict(userId, day, weekStartDate) {
  const blocks = await CalendarBlock.findByUserAndWeek(userId, weekStartDate);
  
  const workoutBlocks = blocks.filter(
    block => block.type === 'workout' && block.day_of_week === day
  );

  return workoutBlocks.length > 0;
}

/**
 * Suggest rest days based on workout intensity
 * @param {Array} workouts - Array of scheduled workouts
 * @returns {Array} Suggested rest days
 */
function suggestRestDays(workouts) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const workoutDays = workouts.map(w => w.day_of_week);
  
  return days.filter(day => !workoutDays.includes(day));
}

module.exports = {
  PROGRAM_TYPES,
  suggestWorkoutDays,
  calculateWorkoutVolume,
  checkWorkoutConflict,
  suggestRestDays
};
