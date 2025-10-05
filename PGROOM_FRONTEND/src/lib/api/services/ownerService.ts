import { apiService } from '../apiService';
import { endpoints } from '../endpoints';
import { ApiResponse } from '@/lib/types/api';

/**
 * Owner pagination parameters
 */
export interface OwnerPaginationParams {
  page: number;
  limit: number;
  filters?: {
    search?: string;
    status?: string;
    stateId?: number;
    cityId?: number;
  };
}

/**
 * Owner interface
 */
export interface OwnerData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  address: string;
  stateId: number;
  cityId: number;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  verified: boolean;
  rating: number;
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  monthlyRevenue: number;
  stateName: string;
  cityName: string;
}

/**
 * Owner list response interface
 */
export interface OwnerListResponse {
  data: OwnerData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Owner statistics interface
 */
export interface OwnerStatistics {
  totalOwners: number;
  activeOwners: number;
  totalProperties: number;
  totalRevenue: number;
  averageOccupancy: number;
}

/**
 * Owner status update data
 */
export interface OwnerStatusUpdateData {
  ownerId: number;
  status: 'Active' | 'Inactive' | 'Suspended';
}

/**
 * Owner service for handling owner-related API calls
 */
export const ownerService = {
  /**
   * Get a paginated list of owners for admin
   * @param params - Pagination and filter parameters
   */
  getOwners: async (params: OwnerPaginationParams): Promise<ApiResponse<OwnerListResponse>> => {
    const { page, limit, filters } = params;

    // Create payload for POST request
    const payload = {
      page,
      limit,
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.stateId && { stateId: filters.stateId }),
      ...(filters?.cityId && { cityId: filters.cityId }),
    };

    return apiService.post(endpoints.OWNER.ADMIN_LIST, payload);
  },

  /**
   * Get owner statistics for admin dashboard
   */
  getOwnerStatistics: async (): Promise<ApiResponse<OwnerStatistics>> => {
    return apiService.get(endpoints.OWNER.ADMIN_STATISTICS);
  },

  /**
   * Update owner status (activate/suspend/deactivate)
   * @param data - Owner status update data
   */
  updateOwnerStatus: async (data: OwnerStatusUpdateData): Promise<ApiResponse<OwnerData>> => {
    return apiService.put(endpoints.OWNER.UPDATE_STATUS, data);
  },
};
