import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';

export interface State {
  id: number;
  stateName: string;
}

export interface City {
  id: number;
  cityName: string;
}

/**
 * Location service for handling location-related API calls
 */
export const locationService = {
  /**
   * Get all states
   */
  getStates: async (): Promise<ApiResponse<State[]>> => {
    return apiService.get(endpoints.LOCATION.STATES);
  },

  /**
   * Get cities by state ID
   * @param stateId - State ID
   */
  getCities: async (stateId: number): Promise<ApiResponse<City[]>> => {
    return apiService.get(endpoints.LOCATION.CITIES(stateId));
  },
};
