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

  // Create public exercises library (using demo user as owner)
  const publicExercises = [
    // Chest
    { name: 'Bench Press', category: 'strength', muscle_groups: ['chest', 'triceps'], is_public: true, user_id: user.id },
    { name: 'Push-ups', category: 'bodyweight', muscle_groups: ['chest', 'triceps', 'shoulders'], is_public: true, user_id: user.id },
    { name: 'Dumbbell Flyes', category: 'strength', muscle_groups: ['chest'], is_public: true, user_id: user.id },
    { name: 'Incline Bench Press', category: 'strength', muscle_groups: ['chest', 'shoulders'], is_public: true, user_id: user.id },
    
    // Back
    { name: 'Pull-ups', category: 'bodyweight', muscle_groups: ['back', 'biceps'], is_public: true, user_id: user.id },
    { name: 'Deadlift', category: 'strength', muscle_groups: ['back', 'legs', 'core'], is_public: true, user_id: user.id },
    { name: 'Bent-Over Rows', category: 'strength', muscle_groups: ['back', 'biceps'], is_public: true, user_id: user.id },
    { name: 'Lat Pulldowns', category: 'strength', muscle_groups: ['back', 'biceps'], is_public: true, user_id: user.id },
    
    // Legs
    { name: 'Squats', category: 'strength', muscle_groups: ['legs', 'glutes', 'core'], is_public: true, user_id: user.id },
    { name: 'Lunges', category: 'strength', muscle_groups: ['legs', 'glutes'], is_public: true, user_id: user.id },
    { name: 'Leg Press', category: 'strength', muscle_groups: ['legs', 'glutes'], is_public: true, user_id: user.id },
    { name: 'Leg Curls', category: 'strength', muscle_groups: ['hamstrings'], is_public: true, user_id: user.id },
    { name: 'Calf Raises', category: 'strength', muscle_groups: ['calves'], is_public: true, user_id: user.id },
    
    // Shoulders
    { name: 'Shoulder Press', category: 'strength', muscle_groups: ['shoulders', 'triceps'], is_public: true, user_id: user.id },
    { name: 'Lateral Raises', category: 'strength', muscle_groups: ['shoulders'], is_public: true, user_id: user.id },
    { name: 'Front Raises', category: 'strength', muscle_groups: ['shoulders'], is_public: true, user_id: user.id },
    
    // Arms
    { name: 'Bicep Curls', category: 'strength', muscle_groups: ['biceps'], is_public: true, user_id: user.id },
    { name: 'Tricep Dips', category: 'bodyweight', muscle_groups: ['triceps', 'chest'], is_public: true, user_id: user.id },
    { name: 'Hammer Curls', category: 'strength', muscle_groups: ['biceps', 'forearms'], is_public: true, user_id: user.id },
    { name: 'Tricep Extensions', category: 'strength', muscle_groups: ['triceps'], is_public: true, user_id: user.id },
    
    // Core
    { name: 'Plank', category: 'bodyweight', muscle_groups: ['core', 'shoulders'], is_public: true, user_id: user.id },
    { name: 'Crunches', category: 'bodyweight', muscle_groups: ['abs'], is_public: true, user_id: user.id },
    { name: 'Russian Twists', category: 'bodyweight', muscle_groups: ['obliques', 'core'], is_public: true, user_id: user.id },
    { name: 'Leg Raises', category: 'bodyweight', muscle_groups: ['abs', 'core'], is_public: true, user_id: user.id },
    
    // Cardio
    { name: 'Running', category: 'cardio', muscle_groups: ['legs', 'cardio'], is_public: true, user_id: user.id },
    { name: 'Cycling', category: 'cardio', muscle_groups: ['legs', 'cardio'], is_public: true, user_id: user.id },
    { name: 'Jump Rope', category: 'cardio', muscle_groups: ['full body', 'cardio'], is_public: true, user_id: user.id },
    { name: 'Burpees', category: 'cardio', muscle_groups: ['full body', 'cardio'], is_public: true, user_id: user.id },
  ];

  await knex('exercises').insert(publicExercises);
  console.log(`✅ ${publicExercises.length} public exercises created!`);
};
