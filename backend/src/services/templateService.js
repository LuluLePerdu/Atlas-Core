/**
 * Template Service
 * Handles week template operations and application
 */

const Template = require('../models/Template');
const CalendarBlock = require('../models/CalendarBlock');

/**
 * Create template from current week
 * @param {string} userId - User ID
 * @param {string} weekStartDate - Week start date
 * @param {string} name - Template name
 * @param {string} description - Template description
 * @returns {Promise<Object>} Created template
 */
async function createFromWeek(userId, weekStartDate, name, description) {
  const blocks = await CalendarBlock.findByUserAndWeek(userId, weekStartDate);

  if (blocks.length === 0) {
    throw new Error('No blocks found for this week');
  }

  const templateBlocks = blocks.map(block => ({
    type: block.type,
    title: block.title,
    day_of_week: block.day_of_week,
    start_time: extractTimeOnly(block.start_time),
    end_time: extractTimeOnly(block.end_time),
    linked_workout_id: block.linked_workout_id,
    linked_recipe_ids: block.linked_recipe_ids,
    notes: block.notes,
    color: block.color,
    recurring: block.recurring
  }));

  return await Template.create({
    user_id: userId,
    name,
    description,
    blocks: templateBlocks
  });
}

/**
 * Apply template to a specific week
 * @param {string} templateId - Template ID
 * @param {string} userId - User ID
 * @param {string} weekStartDate - Target week start date
 * @param {boolean} replaceExisting - Whether to replace existing blocks
 * @returns {Promise<Array>} Created blocks
 */
async function applyToWeek(templateId, userId, weekStartDate, replaceExisting = false) {
  const template = await Template.findById(templateId);

  if (!template || template.user_id !== userId) {
    throw new Error('Template not found or access denied');
  }

  // Optionally clear existing blocks
  if (replaceExisting) {
    const existingBlocks = await CalendarBlock.findByUserAndWeek(userId, weekStartDate);
    await Promise.all(existingBlocks.map(block => CalendarBlock.delete(block.id)));
  }

  // Create blocks from template
  const createdBlocks = [];
  for (const templateBlock of template.blocks) {
    const blockData = {
      user_id: userId,
      type: templateBlock.type,
      title: templateBlock.title,
      day_of_week: templateBlock.day_of_week,
      start_time: combineDateTime(weekStartDate, templateBlock.day_of_week, templateBlock.start_time),
      end_time: combineDateTime(weekStartDate, templateBlock.day_of_week, templateBlock.end_time),
      week_start_date: weekStartDate,
      linked_workout_id: templateBlock.linked_workout_id,
      linked_recipe_ids: templateBlock.linked_recipe_ids,
      notes: templateBlock.notes,
      color: templateBlock.color,
      recurring: templateBlock.recurring
    };

    const block = await CalendarBlock.create(blockData);
    createdBlocks.push(block);
  }

  return createdBlocks;
}

/**
 * Extract time only from ISO datetime
 * @param {string} datetime - ISO datetime string
 * @returns {string} Time in HH:MM format
 */
function extractTimeOnly(datetime) {
  const date = new Date(datetime);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Combine date and time
 * @param {string} weekStartDate - Week start date
 * @param {string} dayOfWeek - Day of week
 * @param {string} time - Time in HH:MM format
 * @returns {string} ISO datetime string
 */
function combineDateTime(weekStartDate, dayOfWeek, time) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayIndex = days.indexOf(dayOfWeek.toLowerCase());

  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + dayIndex);

  const [hours, minutes] = time.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return date.toISOString();
}

/**
 * Compare templates for similarity
 * @param {string} templateId1 - First template ID
 * @param {string} templateId2 - Second template ID
 * @returns {Promise<number>} Similarity score (0-1)
 */
async function compareTemplates(templateId1, templateId2) {
  const template1 = await Template.findById(templateId1);
  const template2 = await Template.findById(templateId2);

  if (!template1 || !template2) return 0;

  const blocks1 = template1.blocks;
  const blocks2 = template2.blocks;

  let matches = 0;
  blocks1.forEach(b1 => {
    const match = blocks2.find(b2 =>
      b2.type === b1.type &&
      b2.day_of_week === b1.day_of_week &&
      b2.start_time === b1.start_time
    );
    if (match) matches++;
  });

  return matches / Math.max(blocks1.length, blocks2.length);
}

module.exports = {
  createFromWeek,
  applyToWeek,
  extractTimeOnly,
  combineDateTime,
  compareTemplates
};
