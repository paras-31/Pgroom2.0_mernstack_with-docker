const jwt = require("jsonwebtoken");
const config = require("../config/InitEnv");
const http = require("../constant/StatusCodes");

class Helper {
  sendError = (res, message, statusCode) => {
    const response = {
      message: message,
      statusCode: statusCode ?? http.UNPROCESSABLE_ENTITY,
    };
    return res.json(response);
  };

  generateToken = (userId, roleId) => {
    // Define the payload with userId and roleId
    const payload = {
      userId,
      roleId,
    };

    // Secret key for signing the JWT
    const secretKey = config.jwt.jwt_secret_key;

    // Generate the JWT
    const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });
    return token;
  };

  paginate = async (model, queryOptions, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    return Promise.all([
      model.findMany({
        ...queryOptions,
        skip,
        take: limit,
      }),
      model.count({ where: queryOptions.where }),
    ]).then(([data, total]) => ({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }));
  };

  getMissingFields = (source, requiredFields = []) => {
    if (!source || typeof source !== "object") return requiredFields.join(", ");
    const missing = requiredFields.filter((field) => !source[field]);
    return missing.length ? missing.join(", ") : null;
  };
}
module.exports = new Helper();
