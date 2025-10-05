/**
 * API Endpoints
 *
 * This file contains all the API endpoints used in the application.
 * Centralizing endpoints makes it easier to manage and update them.
 */

// Auth endpoints
export const AUTH = {
  LOGIN: '/pgrooms/login',
  REGISTER: '/pgrooms/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

// User endpoints
export const USER = {
  PROFILE: '/pgrooms/v1/profile',
  UPDATE_PROFILE: '/pgrooms/v1/profile',
  CHANGE_PASSWORD: '/pgrooms/v1/profile/change-password',
};

// Property endpoints
export const PROPERTY = {
  LIST: '/pgrooms/v1/properties',
  DETAILS: (id: string | number) => `/pgrooms/v1/property/${id}`,
  CREATE: '/pgrooms/v1/property',
  UPDATE: '/pgrooms/v1/property', // PUT endpoint for property update
  DELETE: (id: string | number) => `/pgrooms/v1/property/${id}`,
  UPDATE_STATUS: '/pgrooms/v1/propertyStatus', // PUT endpoint for property status update

  // Admin endpoints
  ADMIN_LIST: '/pgrooms/v1/admin/properties',
  ADMIN_STATISTICS: '/pgrooms/v1/admin/property-statistics',
};

// Owner endpoints
export const OWNER = {
  ADMIN_LIST: '/pgrooms/v1/admin/owners',
  ADMIN_STATISTICS: '/pgrooms/v1/admin/owner-statistics',
  UPDATE_STATUS: '/pgrooms/v1/admin/owner/status',
};

// Admin Dashboard endpoints
export const ADMIN_DASHBOARD = {
  OVERVIEW: '/pgrooms/v1/admin/dashboard/overview',
  RECENT_ACTIVITY: '/pgrooms/v1/admin/dashboard/recent-activity',
  SYSTEM_HEALTH: '/pgrooms/v1/admin/dashboard/system-health',
};

// Location endpoints
export const LOCATION = {
  STATES: '/pgrooms/states',
  CITIES: (stateId: number) => `/pgrooms/cities/${stateId}`,
};

// Room endpoints
export const ROOM = {
  LIST: '/pgrooms/v1/rooms',
  DETAILS: (id: string | number) => `/pgrooms/v1/room/${id}`,
  CREATE: '/pgrooms/v1/room',
  UPDATE: '/pgrooms/v1/room', // PUT endpoint for room update
  DELETE: (id: string | number) => `/pgrooms/v1/room/${id}`,
  UPDATE_STATUS: '/pgrooms/v1/roomStatus', // PUT endpoint for room status update
};

// Tenant endpoints
export const TENANT = {
  LIST: '/pgrooms/v1/getTenants',
  CREATE: '/pgrooms/v1/tenant',
  UPDATE: '/pgrooms/v1/tenant',
  GET: '/pgrooms/v1/tenant',
  ID: '/pgrooms/v1/tenant/id',
  ROOM_DETAILS: '/pgrooms/v1/tenant/room-details',
  
  // Admin endpoints
  ADMIN_LIST: '/pgrooms/v1/admin/tenants',
};

// Dashboard endpoints
export const DASHBOARD = {
  MONITORING_CARDS: '/pgrooms/v1/dashboard-monitoring-cards',
  RECENT_TENANTS: '/pgrooms/v1/dashboard-recent-tenants',
};

// Payment endpoints
export const PAYMENT = {
  CREATE_ORDER: '/pgrooms/v1/payment/create-order',
  VERIFY: '/pgrooms/v1/payment/verify',
  DETAILS: (id: string | number) => `/pgrooms/v1/payment/${id}`,
  LIST: '/pgrooms/v1/payment/list',
  TENANT_PAYMENTS: '/pgrooms/v1/payment/tenant',
  PROPERTY_PAYMENTS: '/pgrooms/v1/payment/property',
  REFUND: '/pgrooms/v1/payment/refund',
  CANCEL: '/pgrooms/v1/payment/cancel',
  STATS: '/pgrooms/v1/payment/stats',
  RECENT: '/pgrooms/v1/payment/recent',
  MONTHLY_ANALYTICS: '/pgrooms/v1/payment/analytics/monthly',
  WEBHOOK: '/pgrooms/payment/webhook',
};

// Export all endpoints
export const endpoints = {
  AUTH,
  USER,
  PROPERTY,
  OWNER,
  ADMIN_DASHBOARD,
  LOCATION,
  ROOM,
  TENANT,
  DASHBOARD,
  PAYMENT,
};
