import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  disabilityType?: string;
  skills?: string[];
  preferences?: any;
  profileCompleted?: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, disabilityType?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values instead of throwing (for hot reload compatibility)
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      isAuthenticated: false
    };
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user info
      const response = await api.get('/auth/me');
      if (response.data.status === 'success' && response.data.data) {
        const userData = response.data.data;
        // Ensure id field exists (Mongoose returns _id, but we also need id)
        setUser({
          ...userData,
          id: userData.id || userData._id
        });
      } else {
        // Invalid token response
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error: any) {
      // Check if it's a network error (backend not running)
      if (error.isNetworkError || !error.response) {
        // Backend server is not running - keep token safe
        console.warn('Backend server is not running. Token preserved.');
        // Don't clear token or user - keep them safe
        // User will remain "logged in" in UI, but API calls will fail
        // This way token is safe when backend comes back online
      } else if (error.response?.status === 401) {
        // Token is actually invalid (server responded with 401)
        console.error('Token is invalid or expired');
        localStorage.removeItem('token');
        setUser(null);
      } else {
        // Other errors - keep token safe
        console.error('Auth check failed:', error);
        // Don't clear token on other errors - might be temporary
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login for:', email);
      console.log('API Base URL:', process.env.REACT_APP_API_URL || '/api (using proxy)');
      
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.status === 'success' && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        console.log('Token saved to localStorage');
        
        // Get user info
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data.status === 'success') {
            const userData = userResponse.data.data;
            setUser({
              ...userData,
              id: userData.id || userData._id
            });
            console.log('User info loaded:', userData);
          }
        } catch (userError: any) {
          // If getting user info fails but login succeeded, token is still saved
          console.warn('Could not fetch user info, but login token is saved');
          // Token is already saved, user can refresh later
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isNetworkError: error.isNetworkError,
        code: error.code
      });
      
      // Check if it's a network error
      if (error.isNetworkError || !error.response) {
        throw new Error('Backend server is not running on port 5001. Please start the server and try again.');
      }
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    disabilityType: string = 'none'
  ): Promise<void> => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        disabilityType
      });
      
      if (response.data.status === 'success' && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        // Get user info
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data.status === 'success') {
            const userData = userResponse.data.data;
            setUser({
              ...userData,
              id: userData.id || userData._id
            });
          }
        } catch (userError: any) {
          // If getting user info fails but registration succeeded, token is still saved
          console.warn('Could not fetch user info, but registration token is saved');
          // Token is already saved, user can refresh later
        }
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      // Check if it's a network error
      if (error.isNetworkError || !error.response) {
        throw new Error('Backend server is not running. Please start the server and try again.');
      }
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

