const Joi = require("joi");
const regex = require("../constant/Regex");

const RoomValidator = Joi.object({
  propertyId: Joi.string().required().empty(["", null]).messages({
    "any.required": "Property Id is required",
    "string.base": "Property Id must be a string",
  }),
  roomNo: Joi.string().required().empty(["", null]).messages({
    "any.required": "Room No is required",
    "string.base": "Room No must be a string",
  }),
  totalBeds: Joi.number().required().empty(["", null]).messages({
    "any.required": "Total Beds is required",
    "number.base": "Total Beds must be a number",
  }),
  description: Joi.string().required().empty(["", null]).messages({
    "any.required": "Description is required",
    "string.base": "Description must be a string",
  }),
  rent: Joi.number().required().empty(["", null]).messages({
    "any.required": "Rent is required",
    "number.base": "Rent must be a number",
  }),
  status: Joi.string().valid("Available", "Occupied").required().messages({
    "any.required": "Status is required",
    "any.only": "Status must be either 'Available' or 'Occupied'",
  }),
  id: Joi.string().optional(),
  useExistingImage: Joi.boolean().optional(),
});

module.exports = RoomValidator;
