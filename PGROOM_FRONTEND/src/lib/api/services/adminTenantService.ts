// filepath: /src/lib/api/services/adminTenantService.ts

import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';

/**
 * Admin tenant response interface
 */
export interface AdminTenantData {
  id: number;
  userId: number;
  propertyId: number;
  roomId: number;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo?: string;
    address?: string;
    stateId?: number;
    cityId?: number;
    status: 'Active' | 'Deleted' | 'Invited';
    state?: {
      id: number;
      stateName: string;
    };
    city?: {
      id: number;
      cityName: string;
    };
  };
  property: {
    id: number;
    name: string;
    address: string;
  };
  room: {
    id: number;
    roomNo: string | number;
    rent: number;
    description?: string;
    status: string;
  };
}

/**
 * Admin tenant list response interface
 */
export interface AdminTenantListResponse {
  data: AdminTenantData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    totalRentCollected: number;
    overduePayments: number;
    averageOccupancy: number;
  };
}

/**
 * Admin tenant filter parameters
 */
export interface AdminTenantFilters {
  search?: string;
  status?: 'all' | 'active' | 'suspended';
  paymentStatus?: 'all' | 'paid' | 'pending' | 'overdue';
  property?: string;
  sortBy?: 'name' | 'email' | 'joinDate' | 'rentAmount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Admin tenant service for handling admin tenant management API calls
 */
export const adminTenantService = {
  /**
   * Get all tenants for admin panel with filtering and pagination
   * Uses the admin tenants API which returns real property and room data
   */
  getAllTenants: async (filters: AdminTenantFilters = {}): Promise<ApiResponse<AdminTenantListResponse>> => {
    try {
      // Prepare request body for the admin tenant API
      const requestBody = {
        search: filters.search || '',
        status: filters.status === 'all' ? 'all' : filters.status || 'active',
        page: filters.page || 1,
        limit: filters.limit || 10,
        sortBy: filters.sortBy === 'name' ? 'user.firstName' : 
                filters.sortBy === 'email' ? 'user.email' : 
                filters.sortBy === 'joinDate' ? 'createdAt' :
                filters.sortBy === 'rentAmount' ? 'Rooms.rent' : 'user.firstName',
        sortOrder: filters.sortOrder || 'asc'
      };

      // Call the admin tenant API
      const response = await apiService.post<AdminTenantListResponse>(
        endpoints.TENANT.ADMIN_LIST,
        requestBody
      );
      
      if (response.statusCode === 200 && response.data) {
        // The API response already contains the correct structure with real property and room data
        // Apply additional client-side filtering if needed
        let filteredData = response.data.data;
        
        if (filters.paymentStatus && filters.paymentStatus !== 'all') {
          // Mock payment status filtering since we don't have payment integration yet
          filteredData = filteredData.filter((_, index) => {
            const paymentStatuses = ['paid', 'pending', 'overdue'];
            const mockPaymentStatus = paymentStatuses[index % 3];
            return mockPaymentStatus === filters.paymentStatus;
          });
        }
        
        if (filters.property && filters.property !== 'all') {
          filteredData = filteredData.filter(tenant => 
            tenant.property.name === filters.property
          );
        }

        // Update stats if we applied additional filtering
        const stats = {
          ...response.data.stats,
          totalTenants: filteredData.length,
          activeTenants: filteredData.filter(t => t.status === 'active').length,
          suspendedTenants: filteredData.filter(t => t.status === 'suspended').length,
          totalRentCollected: filteredData
            .filter(t => t.status === 'active')
            .reduce((sum, tenant) => sum + tenant.room.rent, 0),
          averageOccupancy: filteredData.length > 0 ? 
            Math.round((filteredData.filter(t => t.status === 'active').length / filteredData.length) * 100) : 0
        };

        return {
          statusCode: 200,
          data: {
            ...response.data,
            data: filteredData,
            stats
          },
          message: 'Tenants fetched successfully'
        };

      } else {
        return {
          statusCode: response.statusCode || 500,
          message: response.message || 'Failed to fetch tenants data'
        } as ApiResponse<AdminTenantListResponse>;
      }
      
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to fetch tenants'
      };
    }
  },

  /**
   * Update tenant status
   */
  updateTenantStatus: async (tenantId: number, status: 'active' | 'suspended'): Promise<ApiResponse<{ id: number; status: string }>> => {
    try {
      // Mock implementation - in real app, this would call a backend API
      return {
        statusCode: 200,
        data: { id: tenantId, status },
        message: 'Tenant status updated successfully'
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to update tenant status'
      };
    }
  },

  /**
   * Delete tenant
   */
  deleteTenant: async (tenantId: number): Promise<ApiResponse<{ id: number }>> => {
    try {
      // Mock implementation - in real app, this would call a backend API
      return {
        statusCode: 200,
        data: { id: tenantId },
        message: 'Tenant deleted successfully'
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to delete tenant'
      };
    }
  }
};
