import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';

/**
 * Admin dashboard overview interface
 */
export interface AdminOverviewData {
  totalUsers: number;
  totalOwners: number;
  totalTenants: number;
  activeOwners: number;
  activeTenants: number;
  totalProperties: number;
  totalRooms: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

/**
 * Recent activity interface
 */
export interface RecentActivityData {
  id: string;
  type: 'payment' | 'registration' | 'property' | 'tenant';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

/**
 * System health metrics interface
 */
export interface SystemHealthData {
  systemStatus: string;
  databaseStatus: string;
  totalRecords: number;
  apiResponseTime: number;
  uptime: string;
  activeConnections: number;
}

/**
 * Admin dashboard service for handling admin dashboard API calls
 */
export const adminDashboardService = {
  /**
   * Get admin dashboard overview statistics
   */
  getAdminOverview: async (): Promise<ApiResponse<AdminOverviewData>> => {
    return apiService.get(endpoints.ADMIN_DASHBOARD.OVERVIEW);
  },

  /**
   * Get recent activity for admin dashboard
   */
  getRecentActivity: async (): Promise<ApiResponse<RecentActivityData[]>> => {
    return apiService.get(endpoints.ADMIN_DASHBOARD.RECENT_ACTIVITY);
  },

  /**
   * Get system health metrics for admin dashboard
   */
  getSystemHealthMetrics: async (): Promise<ApiResponse<SystemHealthData>> => {
    return apiService.get(endpoints.ADMIN_DASHBOARD.SYSTEM_HEALTH);
  },
};
