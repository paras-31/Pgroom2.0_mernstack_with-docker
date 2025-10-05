const jwt = require('jsonwebtoken');
const config = require('../config/InitEnv');
const helper = require("../utils/Helper");
const http = require("../constant/StatusCodes");
const constMessage = require("../constant/Message");

const AuthMiddleware = (req, res, next) => {
    // Extract the token from the 'Authorization' header
    const authHeader = req.header('Authorization');

    // Validate the presence and format of the Authorization header
    if (!authHeader?.startsWith('Bearer ')) {
        return helper.sendError(res, constMessage.UNAUTHORIZED, http.UNAUTHORIZED);
    }

    // Extract the token by removing the 'Bearer ' prefix
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, config.jwt.jwt_secret_key);
        // Attach the decoded user information to the request object
        req.authUser = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Handle invalid or expired tokens
        return helper.sendError(res, constMessage.UNAUTHORIZED, http.UNAUTHORIZED);
    }
};

module.exports = AuthMiddleware;