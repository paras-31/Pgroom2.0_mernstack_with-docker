const profileService = require("../services/ProfileService");
const Controller = require("./Controller");
const http = require("../constant/StatusCodes");
const constMessage = require("../constant/Message");
const { LoginValidator, RegisterValidator } = require("../validators/index");
const ChangePasswordValidator = require("../validators/ChangePasswordValidator");
const validateRequest = require("../middleware/ValidationMiddleware");

class ProfileController extends Controller {
  constructor() {
    super();
    this.profileService = new profileService();
  }

  /**
   * Function to login
   */
  login = [
    validateRequest(LoginValidator),
    async (req, res) => {
      try {
        const result = await this.profileService.login(req, res);
        this.sendResponse(
          res,
          result,
          constMessage.FETCH_SUCCESSFUL.replace(":name", "User"),
          http.OK
        );
      } catch (error) {
        this.sendErrorResponse(
          res,
          error.message || error,
          error.statusCode || http.INTERNAL_SERVER_ERROR
        );
      }
    },
  ];

  /**
   * Function to register
   */
  createAccount = [
    validateRequest(RegisterValidator),
    async (req, res) => {
      try {
        const result = await this.profileService.createAccount(req, res);
        const message = result
          ? constMessage.CREATED_SUCCESSFULLY.replace(":name", "User")
          : constMessage.SOMETHING_WENT_WRONG;
        const status = result ? http.OK : http.INTERNAL_SERVER_ERROR;

        this.sendResponse(res, result, message, status);
      } catch (error) {
        this.sendErrorResponse(res, error);
      }
    },
  ];

  /**
   * Function to get user profile
   */
  getUserProfile = async (req, res) => {
    try {
      const result = await this.profileService.getUserProfile(req);
      this.sendResponse(
        res,
        result,
        constMessage.FETCH_SUCCESSFUL.replace(":name", "Profile"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Function to update user profile
   */
  updateUserProfile = async (req, res) => {
    try {
      const result = await this.profileService.updateUserProfile(req);
      this.sendResponse(
        res,
        result,
        constMessage.UPDATED_SUCCESSFULLY.replace(":name", "Profile"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Function to change user password
   */
  changePassword = [
    validateRequest(ChangePasswordValidator),
    async (req, res) => {
      try {
        const result = await this.profileService.changePassword(req, res);
        this.sendResponse(
          res,
          result,
          result.message || "Password changed successfully",
          result.statusCode || http.OK
        );
      } catch (error) {
        this.sendErrorResponse(res, error);
      }
    }
  ];
}

module.exports = new ProfileController();
