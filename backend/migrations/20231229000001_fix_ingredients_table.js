exports.up = async function(knex) {
  // Drop ingredients table if exists
  await knex.schema.dropTableIfExists('ingredients');
  
  // Recreate without FK constraint
  return knex.schema.createTable('ingredients', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('name_fr');
    table.string('name_en');
    table.decimal('calories_per_100g', 8, 2).notNullable();
    table.decimal('protein_per_100g', 8, 2).notNullable();
    table.decimal('carbs_per_100g', 8, 2).notNullable();
    table.decimal('fat_per_100g', 8, 2).notNullable();
    table.string('category');
    table.string('source').defaultTo('local');
    table.uuid('user_id').nullable();
    table.timestamps(true, true);
    
    // Indexes for search
    table.index('name');
    table.index('name_fr');
    table.index('name_en');
    table.index('category');
    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ingredients');
};
