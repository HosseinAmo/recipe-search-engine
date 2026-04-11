/**
 * @file validateMiddleware.js
 * @description Reusable express-validator error-collection middleware.
 * Checks for validation errors added by express-validator chains and
 * returns a 422 response with user-appropriate messages if any are found.
 * @author Hossein
 */

const { validationResult } = require('express-validator');

/**
 * Collects express-validator errors from the request and returns a 422
 * JSON response if any errors exist.  Otherwise it calls next().
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array(),   // array of { msg, path, ... }
    });
  }
  next();
}

module.exports = { validate };
