// validators/schemas/registerValidator.js
const Joi = require('joi');
const regex = require('../constant/Regex');
const { EmailExists, MobileExists } = require('../rules');

const RegisterValidator = Joi.object({
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
    .required()
    .not().empty()
    .external(EmailExists.validate)
    .messages({
      'string.base': 'Email must be a string',
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
      'string.empty': 'Email is required',
    }),
  mobileNo: Joi.string()
    .length(10)
    .required()
    .not().empty()
    .external(MobileExists.validate)
    .messages({
      'string.base': 'Mobile No must be a string',
      'string.length': 'Mobile Number must be exactly 10 digits',
      'any.required': 'Mobile Number is required',
      'string.empty': 'Mobile Number is required',
    }),
  state: Joi.number()
    .required()
    .not().empty()
    .messages({
      'number.base': 'State must be a Number',
      'any.required': 'State is required',
      'number.empty': 'State is required',
    }),
  city: Joi.number()
    .required()
    .not().empty()
    .messages({
      'number.base': 'City must be a Number',
      'any.required': 'City is required',
      'number.empty': 'City is required',
    }),
  password: Joi.string()
    .required()
    .not().empty()
    .pattern(new RegExp(regex.PASSWORD_REGEX))
    .messages({
      'string.base': 'Password must be a string',
      'string.pattern.base': 'Password must be at least 8 characters long, include at least one letter, one number, and one special character.',
      'any.required': 'Password is required',
      'string.empty': 'Password is required',
    }),
  confirmPassword: Joi.string()
    .required()
    .not().empty()
    .valid(Joi.ref('password'))
    .messages({
      'string.base': 'Confirm Password must be a string',
      'any.only': 'Confirm Password must match Password',
      'any.required': 'Confirm Password is required',
      'string.empty': 'Confirm Password is required',
    }),
  isAdmin: Joi.boolean()
    .required()
    .not().empty()
    .messages({
      'boolean.base': 'isAdmin must be a boolean',
      'any.required': 'isAdmin is required',
      'boolean.empty': 'isAdmin is required',
    }),
  address: Joi.string()
    .required()
    .not().empty()
    .messages({
      'string.base': 'Address must be a string',
      'any.required': 'Address is required',
      'string.empty': 'Address is required',
    }),
  status : Joi.string().optional(),
});

module.exports = RegisterValidator;