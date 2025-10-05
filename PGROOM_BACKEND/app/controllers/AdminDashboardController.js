const AdminDashboardService = require("../services/AdminDashboardService");
const Controller = require("./Controller");
const http = require("../constant/StatusCodes");
const constMessage = require("../constant/Message");

class AdminDashboardController extends Controller {
  constructor() {
    super();
    this.adminDashboardService = new AdminDashboardService();
  }

  /**
   * Get admin dashboard overview statistics
   * GET /v1/admin/dashboard/overview
   */
  getAdminOverview = async (req, res) => {
    try {
      const result = await this.adminDashboardService.getAdminOverview();
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "Admin Overview"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get recent activity for admin dashboard
   * GET /v1/admin/dashboard/recent-activity
   */
  getRecentActivity = async (req, res) => {
    try {
      const result = await this.adminDashboardService.getRecentActivity();
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "Recent Activity"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get system health metrics for admin dashboard
   * GET /v1/admin/dashboard/system-health
   */
  getSystemHealthMetrics = async (req, res) => {
    try {
      const result = await this.adminDashboardService.getSystemHealthMetrics();
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "System Health Metrics"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };
}

module.exports = new AdminDashboardController();
