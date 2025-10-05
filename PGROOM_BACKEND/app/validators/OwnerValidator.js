const Joi = require('joi');

class OwnerValidator {
  /**
   * Validator for getting owners list
   */
  static getOwnersValidator = Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(100).optional().messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must be at most 100'
    }),
    search: Joi.string().trim().allow('').optional().messages({
      'string.base': 'Search must be a string'
    }),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended').optional().messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be Active, Inactive, or Suspended'
    }),
    stateId: Joi.number().integer().min(1).optional().messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.min': 'State ID must be at least 1'
    }),
    cityId: Joi.number().integer().min(1).optional().messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.min': 'City ID must be at least 1'
    })
  });

  /**
   * Validator for updating owner status
   */
  static updateOwnerStatusValidator = Joi.object({
    ownerId: Joi.number().integer().min(1).required().messages({
      'number.base': 'Owner ID must be a number',
      'number.integer': 'Owner ID must be an integer',
      'number.min': 'Owner ID must be at least 1',
      'any.required': 'Owner ID is required'
    }),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended').required().messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be Active, Inactive, or Suspended',
      'any.required': 'Status is required'
    })
  });
}

module.exports = OwnerValidator;
