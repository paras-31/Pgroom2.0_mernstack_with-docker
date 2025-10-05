import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';

/**
 * Tenant user interface
 */
export interface TenantUser {
  id?: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo?: string;
    address?: string;
    stateId?: number;
    cityId?: number;
    state?: {
      stateName: string;
    };
    city?: {
      cityName: string;
    };
    profileImage?: string;
    status?: 'Active' | 'Inactive' | 'Invited';
  };
}

/**
 * Tenant list response interface
 */
export interface TenantListResponse {
  data: TenantUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Tenant pagination parameters
 */
export interface TenantPaginationParams {
  page: number;
  limit: number;
  filters?: {
    search?: string;
    state?: number;
    city?: number;
    status?: 'Active' | 'Invited';
    sortField?: 'name' | 'email' | 'location';
    sortDirection?: 'asc' | 'desc';
  };
}

/**
 * Tenant room details interface
 */
export interface TenantRoomDetails {
  id: number;
  roomNo: string;
  rent: string | number;
  description?: string;
  status: string;
  totalBed: number;
  roomImage: string[];
  property: {
    id: number;
    name: string;
    address: string;
    type: string;
  };
  tenants: Array<{
    id: number;
    name: string;
    firstName: string;
    lastName: string;
  }>;
  occupancy: {
    current: number;
    total: number;
  };
}

/**
 * Tenant service for handling tenant-related API calls
 */
export const tenantService = {
  /**
   * Get a paginated list of potential tenants (users with tenant role)
   * @param params - Pagination and filter parameters
   */
  getTenants: async (params: TenantPaginationParams): Promise<ApiResponse<TenantListResponse>> => {
    const { page, limit, filters } = params;

    // Create payload for POST request
    const payload = {
      stateId: filters?.state ? String(filters.state) : "",
      cityId: filters?.city ? String(filters.city) : "",
      status: filters?.status || "Active",
      page,
      limit,
      search: filters?.search || ""
    };

    return apiService.post(endpoints.TENANT.LIST, payload);
  },

  /**
   * Assign tenant to a property and room
   * @param data - Tenant assignment data
   */
  assignTenant: async (data: {
    userIds: number[];
    propertyId: number;
    roomId: number;
  }): Promise<ApiResponse<any>> => {
    return apiService.post(endpoints.TENANT.CREATE, data);
  },

  /**
   * Update tenant assignment
   * @param data - Tenant update data
   */
  updateTenant: async (data: {
    ids?: number[];
    userIds: number[];
    propertyId: number;
    roomId: number;
  }): Promise<ApiResponse<any>> => {
    return apiService.put(endpoints.TENANT.UPDATE, data);
  },

  /**
   * Bulk update tenants in a room
   * @param data - Bulk tenant update data with empty userIds and selected tenant ids
   */
  bulkUpdateTenants: async (data: {
    userIds: number[]; // Will be empty for all
    ids: string[] | number[]; // Contains the user ids for the selected users
    propertyId: number;
    roomId: number;
  }): Promise<ApiResponse<any>> => {
    return apiService.put(endpoints.TENANT.UPDATE, data);
  },

  /**
   * Get tenants for a specific property and room
   * @param propertyId - Property ID
   * @param roomId - Room ID
   */
  getTenantsByRoom: async (propertyId: number, roomId: number): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('propertyId', String(propertyId));
    queryParams.append('roomId', String(roomId));

    return apiService.get(`${endpoints.TENANT.GET}?${queryParams.toString()}`);
  },

  /**
   * Get current tenant's room details
   */
  getTenantRoomDetails: async (): Promise<ApiResponse<TenantRoomDetails>> => {
    return apiService.get(endpoints.TENANT.ROOM_DETAILS);
  }
};
