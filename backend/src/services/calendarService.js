/**
 * Calendar Service
 * Handles calendar operations, scheduling, and conflict detection
 */

const CalendarBlock = require('../models/CalendarBlock');

/**
 * Find time conflicts for a new block
 * @param {string} userId - User ID
 * @param {string} startTime - Start time (ISO)
 * @param {string} endTime - End time (ISO)
 * @param {string} excludeBlockId - Block ID to exclude (for updates)
 * @returns {Promise<Array>} Conflicting blocks
 */
async function findConflicts(userId, startTime, endTime, excludeBlockId = null) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const blocks = await CalendarBlock.findByUserAndDateRange(
    userId,
    start,
    end
  );

  return blocks.filter(block => {
    if (excludeBlockId && block.id === excludeBlockId) return false;

    const blockStart = new Date(block.start_time);
    const blockEnd = new Date(block.end_time);

    // Check for overlap
    return (start < blockEnd && end > blockStart);
  });
}

/**
 * Get week overview with statistics
 * @param {string} userId - User ID
 * @param {string} weekStartDate - Week start date
 * @returns {Promise<Object>} Week overview
 */
async function getWeekOverview(userId, weekStartDate) {
  const blocks = await CalendarBlock.findByUserAndWeek(userId, weekStartDate);

  const stats = {
    total_blocks: blocks.length,
    workout_count: 0,
    meal_count: 0,
    work_hours: 0,
    sleep_hours: 0,
    free_time: 0
  };

  blocks.forEach(block => {
    const duration = (new Date(block.end_time) - new Date(block.start_time)) / (1000 * 60 * 60);

    switch (block.type) {
      case 'workout':
        stats.workout_count++;
        break;
      case 'meal':
        stats.meal_count++;
        break;
      case 'work':
        stats.work_hours += duration;
        break;
      case 'sleep':
        stats.sleep_hours += duration;
        break;
      default:
        stats.free_time += duration;
    }
  });

  return {
    week_start_date: weekStartDate,
    blocks,
    stats
  };
}

/**
 * Suggest optimal time for a block based on existing schedule
 * @param {string} userId - User ID
 * @param {string} weekStartDate - Week start date
 * @param {string} blockType - Type of block
 * @param {number} duration - Duration in minutes
 * @returns {Promise<Object>} Suggested time slot
 */
async function suggestTimeSlot(userId, weekStartDate, blockType, duration) {
  const blocks = await CalendarBlock.findByUserAndWeek(userId, weekStartDate);
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const preferredTimes = {
    workout: { start: 6, end: 9 }, // 6 AM - 9 AM or 5 PM - 8 PM
    meal: { start: 12, end: 13 }, // Noon - 1 PM
    work: { start: 9, end: 17 } // 9 AM - 5 PM
  };

  // Simple algorithm - find first available slot in preferred times
  for (let day of days) {
    const dayBlocks = blocks.filter(b => b.day_of_week === day);
    
    // Check morning slot
    const morningStart = new Date(weekStartDate);
    morningStart.setHours(preferredTimes[blockType]?.start || 9);
    const morningEnd = new Date(morningStart);
    morningEnd.setMinutes(morningEnd.getMinutes() + duration);

    const conflicts = await findConflicts(
      userId,
      morningStart.toISOString(),
      morningEnd.toISOString()
    );

    if (conflicts.length === 0) {
      return {
        day,
        start_time: morningStart.toISOString(),
        end_time: morningEnd.toISOString()
      };
    }
  }

  return null;
}

module.exports = {
  findConflicts,
  getWeekOverview,
  suggestTimeSlot
};
