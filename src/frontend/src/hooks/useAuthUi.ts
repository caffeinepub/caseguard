/**
 * UI-focused wrapper around useInternetIdentity that provides:
 * - Safe login with configuration checks
 * - No-op login when already authenticated
 * - Retry logic with state cleanup
 * - Effective error/status for consistent UI rendering
 * - Normalized string-safe error messages for UI components
 */

import { useCallback, useMemo, useState } from 'react';
import { useInternetIdentity, type Status } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuthClientStorage } from '../utils/authClientStorage';
import { normalizeAuthError } from '../utils/normalizeAuthError';
import { logAuthLifecycle } from '../utils/authDiagnostics';

export interface AuthUiState {
  identity?: any;
  isAuthenticated: boolean;
  effectiveStatus: Status;
  loginError?: Error;
  loginErrorMessage?: string;
  isInitializing: boolean;
  isLoggingIn: boolean;
  startLogin: () => void;
  retryLogin: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuthUi(): AuthUiState {
  const internetIdentity = useInternetIdentity();
  const queryClient = useQueryClient();
  const [configError, setConfigError] = useState<string | null>(null);

  const { identity, login, clear, loginStatus, loginError, isInitializing, isLoggingIn } =
    internetIdentity;

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Normalize error to string-safe message for UI rendering
  const loginErrorMessage = useMemo(() => {
    // Don't show errors while actively logging in
    if (isLoggingIn) {
      return undefined;
    }

    // Don't show errors when successfully authenticated
    if (isAuthenticated && loginStatus === 'success') {
      return undefined;
    }

    // Prioritize config error
    if (configError) {
      logAuthLifecycle('UI error message', { source: 'config', message: configError });
      return configError;
    }
    
    if (!loginError) return undefined;

    // Suppress "already authenticated" error
    const errorStr = normalizeAuthError(loginError);
    if (errorStr.toLowerCase().includes('already authenticated')) {
      logAuthLifecycle('UI error suppressed', { reason: 'already authenticated' });
      return undefined;
    }

    logAuthLifecycle('UI error message', { source: 'login', message: errorStr });
    return errorStr;
  }, [loginError, configError, isLoggingIn, isAuthenticated, loginStatus]);

  // Derive effective status
  const effectiveStatus: Status = useMemo(() => {
    // Preserve success status when authenticated
    if (isAuthenticated && loginStatus === 'success') {
      return 'success';
    }

    // Show logging-in status
    if (isLoggingIn) {
      return 'logging-in';
    }

    // Show error state if there's an error message
    if (configError || (loginError && loginErrorMessage)) {
      return 'loginError';
    }

    return loginStatus;
  }, [loginStatus, loginError, loginErrorMessage, configError, isLoggingIn, isAuthenticated]);

  // Safe login that checks configuration first and is a no-op when already authenticated
  const startLogin = useCallback(() => {
    logAuthLifecycle('UI startLogin called', { isAuthenticated });
    
    // No-op if already authenticated
    if (isAuthenticated) {
      logAuthLifecycle('UI startLogin blocked - already authenticated');
      return;
    }

    try {
      // Clear any previous config errors
      setConfigError(null);

      // Check if II_URL is configured
      if (typeof process !== 'undefined' && process.env) {
        if (!process.env.II_URL || process.env.II_URL.trim() === '') {
          const errorMsg = 'Internet Identity provider URL is not configured. Please check your environment settings and refresh the page.';
          setConfigError(errorMsg);
          console.error('Login configuration error:', errorMsg);
          return;
        }
      } else {
        const errorMsg = 'Environment configuration is not available. Please refresh the page.';
        setConfigError(errorMsg);
        console.error('Login configuration error:', errorMsg);
        return;
      }

      // Attempt login
      login();
    } catch (error) {
      // Suppress "already authenticated" errors
      const errorStr = normalizeAuthError(error);
      if (errorStr.toLowerCase().includes('already authenticated')) {
        logAuthLifecycle('UI startLogin error suppressed', { reason: 'already authenticated' });
        return;
      }
      setConfigError(errorStr);
      console.error('Login error:', error);
    }
  }, [login, isAuthenticated]);

  // Retry login with full state cleanup
  const retryLogin = useCallback(async () => {
    logAuthLifecycle('UI retryLogin called');
    
    try {
      // Clear config error state
      setConfigError(null);

      // Clear auth hook state
      if (clear) {
        await clear();
      }

      // Clear client storage
      clearAuthClientStorage();

      // Clear React Query cache
      queryClient.clear();

      // Small delay to ensure cleanup completes
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Attempt login again
      startLogin();
    } catch (error) {
      const errorMsg = normalizeAuthError(error);
      setConfigError(errorMsg);
      console.error('Retry login error:', error);
      throw error;
    }
  }, [clear, queryClient, startLogin]);

  // Logout with cache clearing
  const logout = useCallback(async () => {
    logAuthLifecycle('UI logout called');
    
    try {
      setConfigError(null);
      await clear();
      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [clear, queryClient]);

  // Clear error state
  const clearError = useCallback(() => {
    logAuthLifecycle('UI clearError called');
    setConfigError(null);
  }, []);

  return {
    identity,
    isAuthenticated,
    effectiveStatus,
    loginError,
    loginErrorMessage,
    isInitializing,
    isLoggingIn,
    startLogin,
    retryLogin,
    logout,
    clearError,
  };
}
