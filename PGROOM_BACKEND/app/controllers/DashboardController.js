const dashBoardService = require("../services/DashBoardService");
const Controller = require("./Controller");
const http = require("../constant/StatusCodes");
const constMessage = require("../constant/Message");
const constant = require("../constant/Constant");

class DashboardController extends Controller {
  constructor(dashBoardService) {
    super();
    this.dashBoardService = dashBoardService;
  }

  getMonitoringCards = async (req, res) => {
    try {
      const result = await this.dashBoardService.getMonitoringCards(req);
      const message = constMessage.FETCH_SUCCESSFUL.replace(":name", "Monitoring Cards");

      this.sendResponse(res, result, message, http.OK);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  getRecentTenants = async (req, res) => {
    try {
      const result = await this.dashBoardService.getRecentTenants(req);
      const message = constMessage.FETCH_SUCCESSFUL.replace(":name", "Recent Tenants");

      this.sendResponse(res, result, message, http.OK);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };
}

module.exports = new DashboardController(new dashBoardService());
