const propertyService = require("../services/PropertyService");
const Controller = require("./Controller");
const http = require("../constant/StatusCodes");
const constMessage = require("../constant/Message");
const constant = require("../constant/Constant");

class PropertyController extends Controller {
  constructor(propertyService) {
    super();
    this.propertyService = propertyService;
  }

  /**
   * Function to add property
   */
  addProperty = async (req, res) => {
    try {
      const result = await this.propertyService.addProperty(req);
      this.sendResponse(
        res,
        result,
        constMessage.CREATED_SUCCESSFULLY.replace(":name", "Property"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Function to get property
   */
  getProperty = async (req, res) => {
    try {
      const result = await this.propertyService.getProperty(req);
      const statusCode =
        result === constant.NOT_FOUND ? http.NOT_FOUND : http.OK;
      const message =
        result === constant.NOT_FOUND
          ? constMessage.NOT_FOUND.replace(":name", "Property")
          : constMessage.DELETED_SUCCESSFULLY.replace(":name", "Property");
      this.sendResponse(res, result, message, statusCode);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Function to delete property
   */
  deleteProperty = async (req, res) => {
    try {
      const result = await this.propertyService.deleteProperty(req);
      const statusCode =
        result === constant.NOT_FOUND ? http.NOT_FOUND : http.OK;
      const message =
        result === constant.NOT_FOUND
          ? constMessage.NOT_FOUND.replace(":name", "Property")
          : constMessage.DELETED_SUCCESSFULLY.replace(":name", "Property");
      this.sendResponse(res, result, message, statusCode);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * function to update property
   */
  updateProperty = async (req, res) => {
    try {
      const result = await this.propertyService.updateProperty(req);
      this.sendResponse(
        res,
        result,
        constMessage.UPDATED_SUCCESSFULLY.replace(":name", "Property"),
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * function to get all properties
   */
  getAllProperties = async (req, res) => {
    try {
      const result = await this.propertyService.getAllProperties(req);
      this.sendResponse(res, result, constMessage.FETCH_SUCCESSFUL.replace(":name", "Property"), http.OK);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * function to update property status
   */
  updatePropertyStatus = async (req, res) => {
    try {
      const result = await this.propertyService.updatePropertyStatus(req);
      this.sendResponse(res, result, constMessage.UPDATED_SUCCESSFULLY.replace(":name", "Property Status"), http.OK);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  /**
   * function to get all properties for admin (includes owner info, room counts, revenue)
   */
  getAllPropertiesForAdmin = async (req, res) => {
    try {
      const result = await this.propertyService.getAllPropertiesForAdmin(req);
      this.sendResponse(res, result, constMessage.FETCH_SUCCESSFUL.replace(":name", "Properties"), http.OK);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * function to get property statistics for admin dashboard
   */
  getPropertyStatistics = async (req, res) => {
    try {
      const result = await this.propertyService.getPropertyStatistics(req);
      this.sendResponse(res, result, constMessage.FETCH_SUCCESSFUL.replace(":name", "Property Statistics"), http.OK);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };
}

module.exports = new PropertyController(new propertyService());
