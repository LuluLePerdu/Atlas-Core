/**
 * Add recipe_id column to calendar_blocks for meal blocks
 */

exports.up = function(knex) {
  return knex.schema.alterTable('calendar_blocks', table => {
    table.uuid('recipe_id').nullable().references('id').inTable('recipes').onDelete('SET NULL');
    table.index('recipe_id', 'idx_calendar_blocks_recipe_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('calendar_blocks', table => {
    table.dropIndex('recipe_id', 'idx_calendar_blocks_recipe_id');
    table.dropColumn('recipe_id');
  });
};
