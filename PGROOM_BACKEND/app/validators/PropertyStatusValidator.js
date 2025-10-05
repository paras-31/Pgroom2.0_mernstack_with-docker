const Joi = require("joi");
const regex = require("../constant/Regex");

const PropertyStatusValidator = Joi.object({
  id : Joi.number().required().empty(["", null]).messages({
    "any.required": "Id is required",
    "number.base": "Id must be a number",
  }),
  status: Joi.string().required().empty(["", null]).valid("Active", "Inactive").messages({
    "any.required": "Status is required",
    "string.base": "Status must be a string",
    "any.only": "Status must be either 'Active' or 'Inactive'",
  }),
});

module.exports = PropertyStatusValidator;
