import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';

/**
 * Dashboard monitoring cards response interface
 */
export interface MonitoringCardsResponse {
  totalProperties: number;
  totalRooms: number;
  totalAssignedTenants: number;
  expectedMonthlyIncome: number;
}

/**
 * Recent tenant interface
 */
export interface RecentTenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

/**
 * Dashboard service for handling dashboard-related API calls
 */
export const dashboardService = {
  /**
   * Get monitoring cards data for the dashboard
   * @returns Promise with monitoring cards data
   */
  getMonitoringCards: async (): Promise<ApiResponse<MonitoringCardsResponse>> => {
    return apiService.get(endpoints.DASHBOARD.MONITORING_CARDS);
  },

  /**
   * Get recent tenants data for the dashboard
   * @returns Promise with recent tenants data
   */
  getRecentTenants: async (): Promise<ApiResponse<RecentTenant[]>> => {
    return apiService.get(endpoints.DASHBOARD.RECENT_TENANTS);
  },
};
