import React, { createContext, useState, useContext, useEffect } from 'react';
import { localApi } from '@/api/localApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    console.log('AuthProvider: Starting checkAppState');
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // Local API: Always set public settings and check auth
      setAppPublicSettings({ id: 'local-app', public_settings: {} });
      await checkUserAuth();
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('Unexpected error in checkAppState:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      console.log('AuthProvider: Checking user auth');
      // Local API: Always authenticated
      setIsLoadingAuth(true);
      const currentUser = await localApi.auth.me();
      console.log('AuthProvider: Got user', currentUser);
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      console.log('AuthProvider: Auth check complete');
    } catch (error) {
      console.error('User auth check failed:', error);
      // Even if auth fails, set a default user so the app can render
      setUser({ id: 'local-user', email: 'user@example.com', full_name: 'Local User' });
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      localApi.auth.logout(window.location.href);
    } else {
      localApi.auth.logout();
    }
  };

  const navigateToLogin = () => {
    localApi.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
