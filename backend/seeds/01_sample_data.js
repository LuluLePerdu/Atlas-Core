/**
 * Seed sample data for development
 */

const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('user_preferences').del();
  await knex('grocery_lists').del();
  await knex('meal_plans').del();
  await knex('recipes').del();
  await knex('week_templates').del();
  await knex('workout_sessions').del();
  await knex('calendar_blocks').del();
  await knex('workouts').del();
  await knex('exercises').del();
  await knex('users').del();

  // Create demo user
  const password_hash = await bcrypt.hash('password123', 10);
  const [user] = await knex('users').insert({
    email: 'demo@atlascore.com',
    password_hash,
    username: 'demo_user'
  }).returning('*');

  console.log('✅ Demo user created successfully!');
  console.log('   Email: demo@atlascore.com');
  console.log('   Password: password123');
};
