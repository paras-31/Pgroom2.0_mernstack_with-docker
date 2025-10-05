const Joi = require('joi');
const helper = require('../utils/Helper');
const http = require('../constant/StatusCodes');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ValidateRequest = (schema) => async (req, res, next) => {
  try {
    const validationOptions = {
      context: { prisma }, // Useful for custom Joi extensions using DB
    };

    await schema.validateAsync(req.body, validationOptions);
    next();
  } catch (error) {
    console.error('Validation Error:', error);

    return helper.sendError(
      res,
      error.details?.[0]?.message || 'Validation failed',
      http.UNPROCESSABLE_ENTITY
    );
  }
};

module.exports = ValidateRequest;
