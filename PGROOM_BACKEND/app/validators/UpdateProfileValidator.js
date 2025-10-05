const Joi = require("joi");

const UpdateProfileValidator = Joi.object({
  firstName: Joi.string()
    .required()
    .not().empty()
    .messages({
      'string.base': 'First Name must be a string',
      'any.required': 'First Name is required',
      'string.empty': 'First Name is required',
    }),
  lastName: Joi.string()
    .required()
    .not().empty()
    .messages({
      'string.base': 'Last Name must be a string',
      'any.required': 'Last Name is required',
      'string.empty': 'Last Name is required',
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
    }),
  mobileNo: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Mobile number must be a string',
    }),
  address: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Address must be a string',
    }),
  stateId: Joi.number()
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
    }),
  cityId: Joi.number()
    .optional()
    .messages({
      'number.base': 'City ID must be a number',
    }),
});

module.exports = UpdateProfileValidator;