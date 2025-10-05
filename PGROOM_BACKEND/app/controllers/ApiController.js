const ApiService = require("../services/ApiService");
const Controller = require("./Controller");
const http = require('../constant/StatusCodes');
const constMessage = require('../constant/Message');

class ApiController extends Controller {
  constructor() {
    super();
    this.apiService = new ApiService();
  }

  /**
   * Function to get all states
   */
  getStates = async (req, res) => {
    try {
      const result = await this.apiService.getAllStates(req);
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "States"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Function to get all cities according to state ID
   */
  getCities = async (req, res) => {
    try {
      const result = await this.apiService.getCities(req, res);
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "Cities"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };
}

module.exports = new ApiController();
