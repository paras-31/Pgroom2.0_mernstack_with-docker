const express = require("express");
const router = express.Router();
const controller = require("../controllers/index");
const validators = require("../validators/index");
const validateRequest = require("../middleware/ValidationMiddleware");
const AuthMiddleware = require("../middleware/AuthMiddelware");
const {
  uploadImages,
  validateFileUpload,
} = require("../middleware/MulterMiddleware");

/**
 * Property Routes
 */
router
  .route("/property")
  .post(
    uploadImages,
    validateFileUpload,
    validateRequest(validators.PropertyValidator),
    controller.PropertyController.addProperty
  )
  .put(
    uploadImages,
    validateFileUpload,
    validateRequest(validators.PropertyValidator),
    controller.PropertyController.updateProperty
  );

router
  .route("/property/:id")
  .get(controller.PropertyController.getProperty)
  .delete(controller.PropertyController.deleteProperty);

router.post("/properties", controller.PropertyController.getAllProperties);

router.put(
  "/propertyStatus",
  validateRequest(validators.PropertyStatusValidator),
  controller.PropertyController.updatePropertyStatus
);

/**
 * Admin Property Routes
 */
router.post("/admin/properties", controller.PropertyController.getAllPropertiesForAdmin);
router.get("/admin/property-statistics", controller.PropertyController.getPropertyStatistics);

/**
 * Admin Owner Routes
 */
router.post("/admin/owners", 
  validateRequest(validators.OwnerValidator.getOwnersValidator),
  controller.UserController.getOwners
);
router.get("/admin/owner-statistics", controller.UserController.getOwnerStatistics);
router.put("/admin/owner/status", 
  validateRequest(validators.OwnerValidator.updateOwnerStatusValidator),
  controller.UserController.updateOwnerStatus
);

/**
 * ROOM ROUTES
 */

router
  .route("/room")
  .post(
    uploadImages,
    validateFileUpload,
    validateRequest(validators.RoomValidator),
    controller.RoomController.addRoom
  )
  .put(
    uploadImages,
    validateFileUpload,
    validateRequest(validators.RoomValidator),
    controller.RoomController.updateRoom
  );

router.post("/rooms", controller.RoomController.getAllRooms);

router
  .route("/room/:id")
  .get(controller.RoomController.getRoom)
  .delete(controller.RoomController.deleteRoom);

/**
 * USER ROUTES
 */
router.post("/getTenants", controller.UserController.getTenants);

/**
 * PROFILE ROUTES
 */
router.get("/profile", controller.ProfileController.getUserProfile);
router.put("/profile", 
  validateRequest(validators.UpdateProfileValidator),
  controller.ProfileController.updateUserProfile
);
router.put("/profile/change-password", controller.ProfileController.changePassword);

/**
 * TENANT ROUTES
 */
router
  .route("/tenant")
  .post(
    validateRequest(validators.TenantValidator),
    controller.TenantController.createTenant
  )
  .put(
    validateRequest(validators.TenantValidator),
    controller.TenantController.updateTenant
  )
  .get(controller.TenantController.getTenants);

// Add route for tenant ID
router.get(
  "/tenant/id",
  controller.TenantController.getTenantId
);

// Add route for tenant's room details
router.get(
  "/tenant/room-details",
  controller.TenantController.getTenantRoomDetails
);

/**
 * Admin Tenant Routes
 */
router.post("/admin/tenants", controller.TenantController.getAllTenantsWithDetails);

/**
 * DASHBOARD ROUTES
 */
router.get(
  "/dashboard-monitoring-cards",
  controller.DashboardController.getMonitoringCards
);
router.get(
  "/dashboard-recent-tenants",
  controller.DashboardController.getRecentTenants
);

/**
 * PAYMENT ROUTES
 */
router
  .route("/payment/create-order")
  .post(
    validateRequest(validators.PaymentValidator.CreatePaymentOrderValidator),
    controller.PaymentController.createPaymentOrder
  );

router
  .route("/payment/verify")
  .post(
    validateRequest(validators.PaymentValidator.VerifyPaymentValidator),
    controller.PaymentController.verifyPayment
  );

router
  .route("/payment/list")
  .post(
    validateRequest(validators.PaymentValidator.PaymentListValidator),
    controller.PaymentController.getAllPayments
  );

router
  .route("/payment/tenant")
  .post(
    validateRequest(validators.PaymentValidator.TenantPaymentsValidator),
    controller.PaymentController.getPaymentsByTenant
  );

router
  .route("/payment/property")
  .post(
    validateRequest(validators.PaymentValidator.PropertyPaymentsValidator),
    controller.PaymentController.getPaymentsByProperty
  );

router
  .route("/payment/refund")
  .post(
    validateRequest(validators.PaymentValidator.RefundValidator),
    controller.PaymentController.initiateRefund
  );

router
  .route("/payment/cancel")
  .post(
    validateRequest(validators.PaymentValidator.CancelPaymentValidator),
    controller.PaymentController.cancelPayment
  );

// Specific payment routes (must come before parameterized routes)
router.get("/payment/stats", controller.PaymentController.getPaymentStats);
router.get("/payment/recent", controller.PaymentController.getRecentPayments);
router.get(
  "/payment/analytics/monthly",
  controller.PaymentController.getMonthlyAnalytics
);

// Parameterized payment routes (must come after specific routes)
router.route("/payment/:id").get(controller.PaymentController.getPaymentById);

/**
 * Admin Dashboard Routes
 */
router.get("/admin/dashboard/overview", AuthMiddleware, controller.AdminDashboardController.getAdminOverview);
router.get("/admin/dashboard/recent-activity", AuthMiddleware, controller.AdminDashboardController.getRecentActivity);
router.get("/admin/dashboard/system-health", AuthMiddleware, controller.AdminDashboardController.getSystemHealthMetrics);

module.exports = router;
