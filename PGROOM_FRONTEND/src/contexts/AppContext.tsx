import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define the shape of our context
interface AppContextType {
  // Global state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Location data
  states: { id: number; name: string }[];
  cities: { id: number; name: string; stateId: number }[];
  
  // Helper functions
  getCitiesByState: (stateId: number) => { id: number; name: string }[];
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  isLoading: false,
  setIsLoading: () => {},
  states: [],
  cities: [],
  getCitiesByState: () => [],
  showErrorToast: () => {},
  showSuccessToast: () => {},
});

// Custom hook to use the app context
export const useApp = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider - Global state provider for the application
 * 
 * This component manages global state and provides utility functions
 * that can be used throughout the application.
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<{ id: number; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string; stateId: number }[]>([]);
  const { toast } = useToast();

  // Fetch states and cities on mount
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch states
        const statesResponse = await fetch('/api/pgrooms/states');
        const statesData = await statesResponse.json();
        
        if (statesData.statusCode === 200) {
          setStates(statesData.data || []);
        }
        
        // Fetch cities
        const citiesResponse = await fetch('/api/pgrooms/cities');
        const citiesData = await citiesResponse.json();
        
        if (citiesData.statusCode === 200) {
          setCities(citiesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
        showErrorToast('Failed to load location data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocationData();
  }, []);

  // Get cities by state ID
  const getCitiesByState = (stateId: number) => {
    if (!stateId) return [];
    return cities.filter(city => city.stateId === stateId);
  };

  // Toast notification helpers
  const showErrorToast = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  const showSuccessToast = (message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    });
  };

  // Context value
  const value = {
    isLoading,
    setIsLoading,
    states,
    cities,
    getCitiesByState,
    showErrorToast,
    showSuccessToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
