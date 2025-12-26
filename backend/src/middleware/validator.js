const { body, param, query, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    console.log('Validation failed:', JSON.stringify(errors.array(), null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  };
};

// Common validations
const userValidation = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('username').isLength({ min: 3, max: 30 }).trim()
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ]
};

const calendarValidation = {
  createBlock: [
    body('type').isIn(['workout', 'meal', 'work', 'sleep', 'other']),
    body('title').isLength({ min: 1, max: 255 }).trim(),
    body('start_time').isISO8601(),
    body('end_time').isISO8601(),
    body('day_of_week').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    body('week_start_date').isDate()
  ]
};

const workoutValidation = {
  create: [
    body('name').isLength({ min: 1, max: 255 }).trim(),
    body('exercises').isArray(),
    body('program_type').optional().isString()
  ]
};

const recipeValidation = {
  create: [
    body('name').isLength({ min: 1, max: 255 }).trim(),
    body('servings').isInt({ min: 1 }),
    body('ingredients').isArray({ min: 1 })
  ]
};

module.exports = {
  validate,
  userValidation,
  calendarValidation,
  workoutValidation,
  recipeValidation
};
