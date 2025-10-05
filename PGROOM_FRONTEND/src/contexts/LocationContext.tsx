import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { endpoints } from '@/lib/api';

// Define types for state and city data
export interface State {
  id: number;
  stateName: string;
}

export interface City {
  id: number;
  cityName: string;
}

// Define the context type
interface LocationContextType {
  states: State[];
  cities: Record<number, City[]>;
  isLoading: boolean;
  error: string | null;
  getCitiesByStateId: (stateId: number) => City[];
  loadCities: (stateId: number) => Promise<City[]>;
}

// Create the context with a default value
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider props type
interface LocationProviderProps {
  children: ReactNode;
}

// Provider component
export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<Record<number, City[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get<{ message: string; statusCode: number; data: State[] }>(endpoints.LOCATION.STATES);
        setStates(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching states:', err);
        setError('Failed to load states. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Function to load cities for a state
  const loadCities = async (stateId: number): Promise<City[]> => {
    try {
      setIsLoading(true);
      const response = await apiService.get<{ message: string; statusCode: number; data: City[] }>(endpoints.LOCATION.CITIES(stateId));

      // Update the cities state with the new data
      const cityData = response.data || [];

      // If the city data is empty, add a placeholder city with ID 0
      const finalCityData = cityData.length === 0
        ? [{ id: 0, cityName: "No cities for this state" }]
        : cityData;

      // Store the data in the cities state
      setCities(prevCities => ({
        ...prevCities,
        [stateId]: finalCityData
      }));

      return finalCityData;
    } catch (err) {
      console.error(`Error fetching cities for state ${stateId}:`, err);
      setError('Failed to load cities. Please try again later.');
      // Set a placeholder city with ID 0 for this state on error
      const placeholderCity = [{ id: 0, cityName: "No cities for this state" }];
      setCities(prevCities => ({
        ...prevCities,
        [stateId]: placeholderCity
      }));
      return placeholderCity;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get cities by state ID
  const getCitiesByStateId = (stateId: number): City[] => {
    // If we already have the cities for this state, return them
    if (cities[stateId]) {
      return cities[stateId];
    }

    // If we don't have the cities yet, fetch them
    loadCities(stateId);

    // Return empty array initially
    return [];
  };

  // Create the context value object
  const contextValue: LocationContextType = {
    states,
    cities,
    isLoading,
    error,
    getCitiesByStateId,
    loadCities
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use the location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
