import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aiyohealth-production-9439.up.railway.app/api';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // Function to get CSRF token
  const getCsrfToken = async () => {
    if (csrfToken) return csrfToken;
    
    try {
      const response = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: 'include'
      });
      const data = await response.json();
      setCsrfToken(data.csrf_token);
      return data.csrf_token;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      return null;
    }
  };

  // Helper function for authenticated requests
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = await getCsrfToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    };

    // Add CSRF token for POST, PUT, DELETE requests
    if (options.method && options.method !== 'GET') {
      headers['X-CSRFToken'] = token;
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to verify the session first
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/current-user`, {
          method: 'GET'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Session is valid, use the current user data
          setUser(data.user);
          setToken('session-active');
          await Preferences.set({ key: 'authUser', value: JSON.stringify(data.user) });
        } else {
          // If session is invalid, try to restore from stored data
          const { value: storedUser } = await Preferences.get({ key: 'authUser' });
          if (storedUser) {
            // Clear stored data since session is invalid
            await Preferences.remove({ key: 'authUser' });
          }
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setToken(null);
        await Preferences.remove({ key: 'authUser' });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (sessionToken, userData) => {
    try {
      if (!userData) {
        throw new Error('No user data provided');
      }
      
      // Store the user data we got from login response
      await Preferences.set({ key: 'authUser', value: JSON.stringify(userData) });
      setUser(userData);
      setToken('session-active');
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const logout = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/logout`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Logout request failed');
      }

      await Preferences.remove({ key: 'authUser' });
      setUser(null);
      setToken(null);
      setCsrfToken(null); // Clear CSRF token on logout
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        apiBaseUrl: API_BASE_URL,
        makeAuthenticatedRequest, // Expose this for use in other components
        getCsrfToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.useAuth = useAuth;
export default AuthProvider;