const Joi = require("joi");
const regex = require("../constant/Regex");
const { TenantExists } = require('../rules');

const TenantValidator = Joi.object({
  userIds: Joi.array().required().empty(["", null]) .external(TenantExists.validate).messages({
    "any.required": "User Ids are required",
    "array.base": "User Ids must be an array",
  }),
  ids : Joi.array().optional(),
  roomId: Joi.required().empty(["", null]).messages({
    "any.required": "Room Id is required",
  }),
  propertyId: Joi.required().empty(["", null]).messages({
    "any.required": "Property Id is required",
  }),
});

module.exports = TenantValidator;
