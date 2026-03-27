/**
 * @file validateMiddleware.js
 * @description express-validator rule sets for all POST/PUT routes.
 *              Provides user-appropriate error messages for every field.
 * @author Hossein
 */

const { body } = require('express-validator');

/**
 * Validation rules for user registration.
 * Checks name, email format, and password strength.
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];

/**
 * Validation rules for user login.
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

/**
 * Validation rules for creating or updating a recipe.
 */
const validateRecipe = [
  body('title')
    .trim()
    .notEmpty().withMessage('Recipe title is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters.'),

  body('ingredients')
    .isArray({ min: 1 }).withMessage('At least one ingredient is required.'),

  body('ingredients.*.name')
    .trim()
    .notEmpty().withMessage('Each ingredient must have a name.'),

  body('ingredients.*.amount')
    .notEmpty().withMessage('Each ingredient must have an amount.')
    .isNumeric().withMessage('Ingredient amount must be a number.'),

  body('cookTime')
    .notEmpty().withMessage('Cook time is required.')
    .isInt({ min: 1 }).withMessage('Cook time must be a positive number of minutes.'),

  body('servings')
    .notEmpty().withMessage('Number of servings is required.')
    .isInt({ min: 1 }).withMessage('Servings must be at least 1.'),

  body('instructions')
    .trim()
    .notEmpty().withMessage('Instructions are required.')
    .isLength({ min: 20 }).withMessage('Instructions must be at least 20 characters.'),
];

/**
 * Validation rules for submitting a review.
 */
const validateReview = [
  body('rating')
    .notEmpty().withMessage('A star rating is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review text is required.')
    .isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters.'),
];

module.exports = { validateRegister, validateLogin, validateRecipe, validateReview };
