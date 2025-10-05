import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';
import { getDecryptedToken } from '@/lib/utils/crypto';

/**
 * Room list response interface
 */
export interface RoomListResponse {
  data: Room[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Room tenant interface
 * Represents a tenant assigned to a room
 */
export interface RoomTenant {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

/**
 * Room interface
 * Represents a room in the system
 */
export interface Room {
  id: number;
  roomNo: string;           // API returns roomNo instead of roomNumber
  roomType?: string;        // May not be present in API response
  status: string;           // API returns status instead of roomStatus
  rent: string | number;    // API returns rent instead of roomPrice
  description?: string;     // API returns description instead of roomDescription
  roomImage?: string[] | string; // API returns roomImage as an array
  propertyId: number;
  totalBed?: number;        // API returns totalBed instead of totalBeds
  amenities?: string[];
  createdAt?: string;
  updatedAt?: string;
  Tenant?: RoomTenant[];    // Tenants assigned to this room
}

/**
 * Room pagination parameters
 */
export interface RoomPaginationParams {
  propertyId: number;
  page: number;
  limit: number;
  filters?: {
    status?: string;
    type?: string;
    search?: string;
  };
}

/**
 * Room service for handling room-related API calls
 */
export const roomService = {
  /**
   * Get a paginated list of rooms for a property
   * @param params - Pagination and filter parameters
   */
  getRooms: async (params: RoomPaginationParams): Promise<ApiResponse<RoomListResponse>> => {
    const { propertyId, page, limit, filters } = params;

    // Create payload for POST request
    const payload = {
      propertyId,
      page,
      limit,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.search && { search: filters.search }),
    };

    return apiService.post(endpoints.ROOM.LIST, payload);
  },

  /**
   * Get a single room by ID
   * @param id - Room ID
   */
  getRoom: async (id: number): Promise<ApiResponse<Room>> => {
    return apiService.get(endpoints.ROOM.DETAILS(id));
  },

  /**
   * Create a new room
   * @param formData - Room form data including images
   */
  createRoom: async (formData: FormData): Promise<ApiResponse<Room>> => {
    return apiService.post(endpoints.ROOM.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update room status
   * @param roomId - Room ID
   * @param status - New status
   */
  updateRoomStatus: async (roomId: number, status: string): Promise<ApiResponse<Room>> => {
    return apiService.put(endpoints.ROOM.UPDATE_STATUS, {
      roomId,
      status,
    });
  },

  /**
   * Update an existing room
   * @param formData - Room form data including images
   * @returns Promise with updated room data
   */
  updateRoom: async (formData: FormData): Promise<ApiResponse<Room>> => {
    try {
      // Use custom fetch to handle FormData with multipart/form-data
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const token = getDecryptedToken();

      const response = await fetch(`${API_BASE_URL}${endpoints.ROOM.UPDATE}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        return responseData;
      } else {
        // Handle non-JSON response (like HTML error pages)
        const textResponse = await response.text();
        console.error('Received non-JSON response:', textResponse);
        return {
          message: 'Server returned an invalid response format. Please try again later.',
          statusCode: response.status
        } as ApiResponse<Room>;
      }
    } catch (error) {
      // Return a formatted error response
      return {
        message: error instanceof Error ? error.message : 'An unknown error occurred during update',
        statusCode: 500
      } as ApiResponse<Room>;
    }
  },

  /**
   * Delete a room
   * @param roomId - Room ID to delete
   * @returns Promise with deletion response
   */
  deleteRoom: async (roomId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiService.delete(endpoints.ROOM.DELETE(roomId));
      return response;
    } catch (error) {
      // Return a formatted error response
      return {
        message: error instanceof Error ? error.message : 'An unknown error occurred during deletion',
        statusCode: 500
      } as ApiResponse<void>;
    }
  },
};
