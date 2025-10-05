const Joi = require('joi');

/**
 * Validation schema for creating a payment order
 */
const CreatePaymentOrderValidator = Joi.object({
  tenantId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tenant ID must be a number',
      'number.integer': 'Tenant ID must be an integer',
      'number.positive': 'Tenant ID must be positive',
      'any.required': 'Tenant ID is required'
    }),

  propertyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Property ID must be a number',
      'number.integer': 'Property ID must be an integer',
      'number.positive': 'Property ID must be positive',
      'any.required': 'Property ID is required'
    }),

  roomId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Room ID must be a number',
      'number.integer': 'Room ID must be an integer',
      'number.positive': 'Room ID must be positive',
      'any.required': 'Room ID is required'
    }),

  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'any.required': 'Amount is required'
    }),

  description: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 255 characters'
    })
});

/**
 * Validation schema for verifying payment
 */
const VerifyPaymentValidator = Joi.object({
  razorpay_order_id: Joi.string()
    .required()
    .pattern(/^order_[A-Za-z0-9]+$/)
    .messages({
      'string.base': 'Razorpay Order ID must be a string',
      'string.pattern.base': 'Invalid Razorpay Order ID format',
      'any.required': 'Razorpay Order ID is required'
    }),

  razorpay_payment_id: Joi.string()
    .required()
    .pattern(/^pay_[A-Za-z0-9]+$/)
    .messages({
      'string.base': 'Razorpay Payment ID must be a string',
      'string.pattern.base': 'Invalid Razorpay Payment ID format',
      'any.required': 'Razorpay Payment ID is required'
    }),

  razorpay_signature: Joi.string()
    .required()
    .messages({
      'string.base': 'Razorpay Signature must be a string',
      'any.required': 'Razorpay Signature is required'
    })
});

/**
 * Validation schema for payment list query parameters
 */
const PaymentListValidator = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  status: Joi.string()
    .valid('Pending', 'Captured', 'Failed', 'Refunded')
    .optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: Pending, Captured, Failed, Refunded'
    }),

  tenantId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Tenant ID must be a number',
      'number.integer': 'Tenant ID must be an integer',
      'number.positive': 'Tenant ID must be positive'
    }),

  propertyId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Property ID must be a number',
      'number.integer': 'Property ID must be an integer',
      'number.positive': 'Property ID must be positive'
    }),

  roomId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Room ID must be a number',
      'number.integer': 'Room ID must be an integer',
      'number.positive': 'Room ID must be positive'
    }),

  search: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.base': 'Search must be a string',
      'string.max': 'Search cannot exceed 255 characters'
    }),

  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format'
    }),

  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format',
      'date.min': 'End date must be after start date'
    })
});

/**
 * Validation schema for refund request
 */
const RefundValidator = Joi.object({
  paymentId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment ID must be a number',
      'number.integer': 'Payment ID must be an integer',
      'number.positive': 'Payment ID must be positive',
      'any.required': 'Payment ID is required'
    }),

  amount: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive'
    }),

  reason: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.base': 'Reason must be a string',
      'string.max': 'Reason cannot exceed 255 characters'
    })
});

/**
 * Validation schema for payment ID parameter
 */
const PaymentIdValidator = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment ID must be a number',
      'number.integer': 'Payment ID must be an integer',
      'number.positive': 'Payment ID must be positive',
      'any.required': 'Payment ID is required'
    })
});

/**
 * Validation schema for tenant payments query
 */
const TenantPaymentsValidator = Joi.object({
  tenantId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tenant ID must be a number',
      'number.integer': 'Tenant ID must be an integer',
      'number.positive': 'Tenant ID must be positive',
      'any.required': 'Tenant ID is required'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  status: Joi.string()
    .valid('Pending', 'Captured', 'Failed', 'Refunded')
    .optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: Pending, Captured, Failed, Refunded'
    })
});

/**
 * Validation schema for property payments query
 */
const PropertyPaymentsValidator = Joi.object({
  propertyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Property ID must be a number',
      'number.integer': 'Property ID must be an integer',
      'number.positive': 'Property ID must be positive',
      'any.required': 'Property ID is required'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  status: Joi.string()
    .valid('Pending', 'Captured', 'Failed', 'Refunded')
    .optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: Pending, Captured, Failed, Refunded'
    })
});

/**
 * Validation schema for cancel payment request
 */
const CancelPaymentValidator = Joi.object({
  paymentId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment ID must be a number',
      'number.integer': 'Payment ID must be an integer',
      'number.positive': 'Payment ID must be positive',
      'any.required': 'Payment ID is required'
    }),

  reason: Joi.string()
    .max(255)
    .optional()
    .default('Cancelled by user')
    .messages({
      'string.base': 'Reason must be a string',
      'string.max': 'Reason cannot exceed 255 characters'
    })
});

module.exports = {
  CreatePaymentOrderValidator,
  VerifyPaymentValidator,
  PaymentListValidator,
  RefundValidator,
  PaymentIdValidator,
  TenantPaymentsValidator,
  PropertyPaymentsValidator,
  CancelPaymentValidator
};
