const Joi = require("joi");

const ChangePasswordValidator = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required"
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "New password must be at least 8 characters long",
    "string.empty": "New password is required",
    "any.required": "New password is required"
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    "any.only": "Confirm password must match new password",
    "any.required": "Confirm password is required"
  })
});

module.exports = ChangePasswordValidator;
