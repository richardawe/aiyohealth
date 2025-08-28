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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to verify the session first
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
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
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout request failed');
      }

      await Preferences.remove({ key: 'authUser' });
      setUser(null);
      setToken(null);
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
        apiBaseUrl: API_BASE_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.useAuth = useAuth;
export default AuthProvider;