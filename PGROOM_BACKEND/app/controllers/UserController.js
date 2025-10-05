const userService = require("../services/UserService");
const Controller = require("./Controller");
const http = require("../constant/StatusCodes");
const constMessage = require("../constant/Message");
const constant = require("../constant/Constant");

class UserController extends Controller {
  constructor(userService) {
    super();
    this.userService = userService;
  }

  /**
   * function to getTenants users
   */
  getTenants = async (req, res) => {
    try {
      const result = await this.userService.getTenants(req.body);
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "Tenants"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * function to get owners for admin
   */
  getOwners = async (req, res) => {
    try {
      const result = await this.userService.getOwners(req.body);
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "Owners"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * function to get owner statistics for admin
   */
  getOwnerStatistics = async (req, res) => {
    try {
      const result = await this.userService.getOwnerStatistics();
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "Owner Statistics"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * function to update owner status
   */
  updateOwnerStatus = async (req, res) => {
    try {
      const result = await this.userService.updateOwnerStatus(req.body);
      this.sendResponse(
        res,
        result,
        constMessage.UPDATED_SUCCESSFULLY.replace(":name", "Owner Status"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };
}

module.exports = new UserController(userService);
