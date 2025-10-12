import { apiService } from '../apiService';
import { endpoints } from '../index';
import { getDecryptedToken } from '@/lib/utils/crypto';
import {
  Property,
  PropertyCreateData,
  PropertyUpdateData,
  PropertyStatusUpdateData,
  PropertyPaginationParams,
  PropertyListResponse,
  AdminPropertyListResponse,
  PropertyStatistics
} from '@/lib/types/property';
import { ApiResponse } from '@/lib/types/api';

/**
 * Property service for handling property-related API calls
 */
export const propertyService = {
  /**
   * Get a paginated list of properties
   * @param params - Pagination and filter parameters
   */
  getProperties: async (params: PropertyPaginationParams): Promise<ApiResponse<PropertyListResponse>> => {
    const { page, limit, filters } = params;

    // Create payload for POST request
    const payload = {
      page,
      limit,
      ...(filters?.state && { state: filters.state }),
      ...(filters?.city && { city: filters.city }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
    };

    return apiService.post(endpoints.PROPERTY.LIST, payload);
  },

  /**
   * Get a single property by ID
   * @param id - Property ID
   */
  getProperty: async (id: number): Promise<ApiResponse<Property>> => {
    return apiService.get(endpoints.PROPERTY.DETAILS(id));
  },

  /**
   * Create a new property
   * @param data - Property data
   */
  createProperty: async (data: PropertyCreateData): Promise<ApiResponse<Property>> => {
    try {
      console.log('Creating property with data:', data);

      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('propertyName', data.propertyName);
      formData.append('propertyAddress', data.propertyAddress);
      formData.append('propertyContact', data.propertyContact);
      formData.append('state', String(data.state));
      formData.append('city', String(data.city));

      // Append image file if it exists
      if (data.images && typeof data.images !== 'string') {
        console.log('Appending image file:', data.images.name);
        formData.append('images', data.images);
      }

      // Use custom fetch to handle FormData
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://backend_con_pgrooms:8000';
      const token = getDecryptedToken();

      console.log('Sending request to:', `${API_BASE_URL}${endpoints.PROPERTY.CREATE}`);

      const response = await fetch(`${API_BASE_URL}${endpoints.PROPERTY.CREATE}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      // Handle validation error format: { "error": "At least one image is required" }
      if (responseData.error) {
        return {
          message: responseData.error,
          statusCode: 422,
        } as ApiResponse<Property>;
      }

      return responseData;
    } catch (error) {
      console.error('Error creating property:', error);
      // Return a formatted error response
      return {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        statusCode: 500
      } as ApiResponse<Property>;
    }
  },

  /**
   * Update an existing property
   * @param data - Property data with ID
   */
  updateProperty: async (data: PropertyUpdateData): Promise<ApiResponse<Property>> => {
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('id', String(data.id));

      // Append other property fields if they exist
      if (data.propertyName) formData.append('propertyName', data.propertyName);
      if (data.propertyAddress) formData.append('propertyAddress', data.propertyAddress);
      if (data.propertyContact) formData.append('propertyContact', data.propertyContact);
      if (data.state) formData.append('state', String(data.state));
      if (data.city) formData.append('city', String(data.city));

      // Handle image submission based on whether it's a new upload or existing image path
      if (data.images) {
        if (typeof data.images === 'string') {
          try {
            // For existing image path, create a file with the path as the name
            // We need to create a file with a valid image MIME type
            // Create a 1x1 transparent PNG image
            const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
            const byteString = atob(base64Data);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < byteString.length; i++) {
              uint8Array[i] = byteString.charCodeAt(i);
            }

            // Create a blob with the image data
            const blob = new Blob([uint8Array], { type: 'image/png' });

            // Create a file with the existing image path as the name
            const file = new File([blob], data.images, { type: 'image/png' });

            // Add the file with the key 'images'
            formData.append('images', file);

            // Add a flag to indicate we're using an existing image
            formData.append('useExistingImage', 'true');
          } catch (error) {
            console.error('Error creating file from existing image path:', error);
            // Fallback to string if file creation fails
            formData.append('images', data.images);
            formData.append('useExistingImage', 'true');
          }
        } else {
          // If it's a File object (new upload), append it as a file
          formData.append('images', data.images);

          // Add a flag to indicate we're NOT using an existing image
          formData.append('useExistingImage', 'false');
        }
      }

      // Use custom fetch to handle FormData
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://backend_con_pgrooms:8000';
      const token = getDecryptedToken();

      const response = await fetch(`${API_BASE_URL}${endpoints.PROPERTY.UPDATE}`, {
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
        } as ApiResponse<Property>;
      }

      // Handle validation error format: { "error": "Some validation error" }
      if (responseData.error) {
        return {
          message: responseData.error,
          statusCode: 422,
        } as ApiResponse<Property>;
      }

      return responseData;
    } catch (error) {
      // Return a formatted error response
      return {
        message: error instanceof Error ? error.message : 'An unknown error occurred during update',
        statusCode: 500
      } as ApiResponse<Property>;
    }
  },

  /**
   * Delete a property
   * @param id - Property ID
   */
  deleteProperty: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiService.delete(endpoints.PROPERTY.DELETE(id));
      return response;
    } catch (error) {
      // Return a formatted error response
      return {
        message: error instanceof Error ? error.message : 'An unknown error occurred during deletion',
        statusCode: 500
      } as ApiResponse<void>;
    }
  },

  /**
   * Update a property's status (Active/Inactive)
   * @param data - Property status update data
   */
  updatePropertyStatus: async (data: PropertyStatusUpdateData): Promise<ApiResponse<Property>> => {
    try {
      // Call the API to update the property status
      const response = await apiService.put(endpoints.PROPERTY.UPDATE_STATUS, data);
      return response;
    } catch (error) {
      // Return a formatted error response
      return {
        message: error instanceof Error ? error.message : 'An unknown error occurred while updating property status',
        statusCode: 500
      } as ApiResponse<Property>;
    }
  },

  /**
   * Admin: Get a paginated list of properties with enhanced data
   * @param params - Pagination and filter parameters
   */
  getAdminProperties: async (params: PropertyPaginationParams): Promise<ApiResponse<AdminPropertyListResponse>> => {
    const { page, limit, filters } = params;

    // Create payload for POST request
    const payload = {
      page,
      limit,
      ...(filters?.state && { state: filters.state }),
      ...(filters?.city && { city: filters.city }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
    };

    return apiService.post(endpoints.PROPERTY.ADMIN_LIST, payload);
  },

  /**
   * Admin: Get property statistics for dashboard
   */
  getPropertyStatistics: async (): Promise<ApiResponse<PropertyStatistics>> => {
    return apiService.get(endpoints.PROPERTY.ADMIN_STATISTICS);
  }
};
