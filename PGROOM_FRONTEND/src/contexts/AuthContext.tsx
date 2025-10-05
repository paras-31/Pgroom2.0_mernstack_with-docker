import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getDecryptedToken, removeToken } from '@/lib/utils/crypto';
import { useNavigate } from 'react-router-dom';

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
  userRole: number | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => boolean;
  updateAuthState: (token?: string, role?: number) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  loading: true,
  logout: () => {},
  checkAuth: () => false,
  updateAuthState: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Parse JWT token to get user data
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check authentication status
  const checkAuthentication = useCallback(() => {
    const token = getDecryptedToken();

    if (!token) {
      setIsAuthenticated(false);
      setUserRole(null);
      setLoading(false);
      return;
    }

    // Check if token is expired
    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
      // Token is expired
      removeToken();
      setIsAuthenticated(false);
      setUserRole(null);
      setLoading(false);
      return;
    }

    // Token is valid
    setIsAuthenticated(true);

    // Set user role if available in token
    if (decodedToken && decodedToken.roleId) {
      setUserRole(decodedToken.roleId);
    }

    setLoading(false);
  }, []);

  // Check if user is authenticated on mount and when token changes
  useEffect(() => {
    checkAuthentication();

    // Set up an interval to periodically check authentication status
    const interval = setInterval(checkAuthentication, 60000); // Check every minute

    // Set up a storage event listener to detect token changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token_encrypted') {
        checkAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthentication]);

  // Logout function
  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  // Function to check authentication status and update state if needed
  const checkAuth = useCallback((): boolean => {
    const token = getDecryptedToken();
    if (!token) {
      setIsAuthenticated(false);
      setUserRole(null);
      return false;
    }

    // Check if token is expired
    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
      removeToken();
      setIsAuthenticated(false);
      setUserRole(null);
      return false;
    }

    // If we get here, token is valid - make sure state is updated
    if (!isAuthenticated) {
      setIsAuthenticated(true);

      // Update role if needed
      if (decodedToken && decodedToken.roleId && userRole !== decodedToken.roleId) {
        setUserRole(decodedToken.roleId);
      }
    }

    return true;
  }, [isAuthenticated, userRole]);

  // Function to update authentication state
  const updateAuthState = useCallback((token?: string, role?: number) => {
    if (token) {
      // If token is provided, update the authentication state
      setIsAuthenticated(true);

      // If role is provided, use it; otherwise try to extract from token
      if (role !== undefined) {
        setUserRole(role);
      } else {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.roleId) {
          setUserRole(decodedToken.roleId);
        }
      }
    } else {
      // If no token is provided, check if there's one in localStorage
      const storedToken = getDecryptedToken();
      if (storedToken) {
        setIsAuthenticated(true);
        const decodedToken = parseJwt(storedToken);
        if (decodedToken && decodedToken.roleId) {
          setUserRole(decodedToken.roleId);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        loading,
        logout,
        checkAuth,
        updateAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
