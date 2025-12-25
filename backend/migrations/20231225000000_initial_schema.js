/**
 * Initial database schema migration
 */

exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('username', 100).notNullable().unique();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    // Calendar blocks table
    .createTable('calendar_blocks', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('type', 50).notNullable();
      table.string('title', 255).notNullable();
      table.timestamp('start_time').notNullable();
      table.timestamp('end_time').notNullable();
      table.string('day_of_week', 10).notNullable();
      table.date('week_start_date').notNullable();
      table.uuid('linked_workout_id').nullable();
      table.specificType('linked_recipe_ids', 'uuid[]').nullable();
      table.text('notes').nullable();
      table.string('color', 20).nullable();
      table.boolean('recurring').defaultTo(false);
      table.jsonb('recurrence_pattern').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index(['user_id', 'week_start_date'], 'idx_calendar_blocks_user_week');
    })
    // Exercises table
    .createTable('exercises', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.string('category', 50).notNullable();
      table.specificType('muscle_groups', 'varchar(50)[]').nullable();
      table.specificType('equipment', 'varchar(50)[]').nullable();
      table.text('instructions').nullable();
      table.string('video_url', 500).nullable();
      table.text('user_notes').nullable();
      table.boolean('is_public').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    // Workouts table
    .createTable('workouts', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.string('program_type', 50).nullable();
      table.jsonb('exercises').notNullable();
      table.integer('estimated_duration').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    // Workout sessions table
    .createTable('workout_sessions', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('workout_id').notNullable().references('id').inTable('workouts').onDelete('CASCADE');
      table.uuid('calendar_block_id').nullable().references('id').inTable('calendar_blocks').onDelete('SET NULL');
      table.date('date').notNullable();
      table.boolean('completed').defaultTo(false);
      table.jsonb('exercises_completed').nullable();
      table.integer('duration_actual').nullable();
      table.text('notes').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['user_id', 'date'], 'idx_workout_sessions_user_date');
    })
    // Recipes table
    .createTable('recipes', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.integer('prep_time').nullable();
      table.integer('cook_time').nullable();
      table.integer('servings').notNullable();
      table.string('difficulty', 20).nullable();
      table.specificType('tags', 'varchar(50)[]').nullable();
      table.jsonb('ingredients').notNullable();
      table.specificType('instructions', 'text[]').nullable();
      table.jsonb('macros_per_serving').nullable();
      table.string('image_url', 500).nullable();
      table.boolean('is_public').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    // Meal plans table
    .createTable('meal_plans', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.date('week_start_date').notNullable();
      table.jsonb('meals').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.unique(['user_id', 'week_start_date']);
      table.index(['user_id', 'week_start_date'], 'idx_meal_plans_user_week');
    })
    // Grocery lists table
    .createTable('grocery_lists', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.date('week_start_date').notNullable();
      table.uuid('meal_plan_id').nullable().references('id').inTable('meal_plans').onDelete('CASCADE');
      table.jsonb('items').notNullable();
      table.decimal('total_estimate', 10, 2).nullable();
      table.timestamp('generated_at').defaultTo(knex.fn.now());
      
      table.unique(['user_id', 'week_start_date']);
      table.index(['user_id', 'week_start_date'], 'idx_grocery_lists_user_week');
    })
    // Week templates table
    .createTable('week_templates', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.jsonb('blocks').notNullable();
      table.uuid('workout_plan_id').nullable();
      table.uuid('meal_plan_id').nullable();
      table.boolean('is_default').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    // User preferences table
    .createTable('user_preferences', table => {
      table.uuid('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
      table.string('theme', 20).defaultTo('olympus');
      table.string('start_of_week', 10).defaultTo('monday');
      table.integer('default_workout_duration').defaultTo(60);
      table.string('default_meal_prep_day', 10).defaultTo('sunday');
      table.jsonb('notification_settings').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    // Add foreign key for linked_workout_id after workouts table exists
    .then(() => {
      return knex.schema.alterTable('calendar_blocks', table => {
        table.foreign('linked_workout_id').references('id').inTable('workouts').onDelete('SET NULL');
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_preferences')
    .dropTableIfExists('week_templates')
    .dropTableIfExists('grocery_lists')
    .dropTableIfExists('meal_plans')
    .dropTableIfExists('recipes')
    .dropTableIfExists('workout_sessions')
    .dropTableIfExists('workouts')
    .dropTableIfExists('exercises')
    .dropTableIfExists('calendar_blocks')
    .dropTableIfExists('users');
};
