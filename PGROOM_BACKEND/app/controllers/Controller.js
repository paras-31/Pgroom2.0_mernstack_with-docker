const http = require('../constant/StatusCodes');
const constMessage = require('../constant/Message');
const logger = require('../utils/Logger');

class Controller {
    sendResponse = (res, data, message, statusCode) => {
        const response = {
            message: message || constMessage.REQUEST_SUCCESSFUL,
            statusCode: statusCode ?? http.OK,
            data: data || null,
        };
        return res.json(response);
    }

    sendErrorResponse = (res, error) => {
        logger.error(error);
        const response = {
            message: constMessage.SOMETHING_WENT_WRONG,
            statusCode: error.statusCode ?? http.INTERNAL_SERVER_ERROR,
        };
        return res.json(response);
    }
}

module.exports = Controller;
