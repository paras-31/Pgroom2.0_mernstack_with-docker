const Joi = require("joi");
const regex = require("../constant/Regex");

const PropertyValidator = Joi.object({
  id: Joi.optional(),
  state: Joi.string().required().empty(["", null]).messages({
    "any.required": "State is required",
    "string.base": "State must be a string",
  }),
  city: Joi.string().required().empty(["", null]).messages({
    "any.required": "City is required",
    "string.base": "City must be a string",
  }),
  propertyName: Joi.string().required().empty(["", null]).messages({
    "any.required": "Property Name is required",
    "string.base": "Property Name must be a string",
  }),
  propertyContact: Joi.string().length(10).required().not().empty().messages({
    "string.base": "Phone Number must be a string",
    "string.length": "Phone Number must be exactly 10 digits",
    "any.required": "Phone Number is required",
    "string.empty": "Phone Number is required",
  }),
  propertyAddress: Joi.string().required().not().empty().messages({
    "string.base": "Property Address must be a string",
    "any.required": "Property Address is required",
    "string.empty": "Property Address is required",
  }),
  useExistingImage : Joi.optional(),
});

module.exports = PropertyValidator;
