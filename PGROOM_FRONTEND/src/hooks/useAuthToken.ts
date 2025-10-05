import { useState, useEffect, useCallback } from 'react';
import { storeEncryptedToken, getDecryptedToken, removeToken } from '@/lib/utils/crypto';

/**
 * Custom hook for managing authentication tokens
 * Provides methods for storing, retrieving, and removing tokens
 * with automatic encryption/decryption
 */
export const useAuthToken = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getDecryptedToken();
    setIsAuthenticated(!!token);
  }, []);

  /**
   * Store an encrypted token in localStorage
   * @param token - The token to store
   */
  const setToken = useCallback((token: string) => {
    if (!token) return;
    
    storeEncryptedToken(token);
    setIsAuthenticated(true);
  }, []);

  /**
   * Get the decrypted token from localStorage
   * @returns The decrypted token or null if not found
   */
  const getToken = useCallback(() => {
    return getDecryptedToken();
  }, []);

  /**
   * Remove the token from localStorage
   */
  const clearToken = useCallback(() => {
    removeToken();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    setToken,
    getToken,
    clearToken
  };
};

export default useAuthToken;
