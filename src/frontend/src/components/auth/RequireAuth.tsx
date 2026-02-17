import { ReactNode, useEffect, useRef } from 'react';
import { useAuthUi } from '../../hooks/useAuthUi';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, AlertCircle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setIntendedRoute, getIntendedRoute, clearIntendedRoute } from '../../utils/intendedRoute';
import { clearAuthClientStorage } from '../../utils/authClientStorage';
import { logNavigation } from '../../utils/authDiagnostics';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, effectiveStatus, loginErrorMessage, isInitializing, isLoggingIn, startLogin, retryLogin } =
    useAuthUi();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track whether we've already navigated to prevent repeated redirects
  const hasNavigatedRef = useRef(false);

  // Persist intended route when unauthenticated
  useEffect(() => {
    if (!isAuthenticated && !isInitializing) {
      const currentPath = location.pathname;
      const currentSearch = window.location.search;
      
      // Only store if not already on root
      if (currentPath !== '/') {
        setIntendedRoute(currentPath, currentSearch);
        logNavigation('Intended route stored', { 
          path: currentPath, 
          search: currentSearch 
        });
      }
    }
  }, [isAuthenticated, isInitializing, location.pathname]);

  // Navigate to intended route after successful authentication (single-shot)
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset navigation flag when not authenticated
      hasNavigatedRef.current = false;
      return;
    }

    // Only navigate once per authentication
    if (hasNavigatedRef.current) {
      logNavigation('Navigation skipped - already navigated');
      return;
    }

    const intendedRoute = getIntendedRoute();
    
    if (!intendedRoute) {
      logNavigation('No intended route to navigate to');
      return;
    }

    // Check if we're already on the intended route
    const currentFullPath = location.pathname + window.location.search;
    if (currentFullPath === intendedRoute) {
      logNavigation('Already on intended route', { route: intendedRoute });
      clearIntendedRoute();
      hasNavigatedRef.current = true;
      return;
    }

    // Perform navigation
    logNavigation('Navigating to intended route', { route: intendedRoute });
    hasNavigatedRef.current = true;
    clearIntendedRoute();
    
    // Use setTimeout to ensure navigation happens after render
    setTimeout(() => {
      navigate({ to: intendedRoute });
    }, 0);
  }, [isAuthenticated, navigate, location.pathname]);

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    const hasError = effectiveStatus === 'loginError' || !!loginErrorMessage;
    const isRetrying = isLoggingIn;

    // Ensure error message is always a string (defensive check)
    const safeErrorMessage = typeof loginErrorMessage === 'string' 
      ? loginErrorMessage 
      : 'Authentication failed. Please try again.';

    const handleClearAndReload = () => {
      logNavigation('Clear and reload triggered');
      clearAuthClientStorage();
      window.location.reload();
    };

    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access CaseGuard. Your case data is protected and requires authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasError && loginErrorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {safeErrorMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={hasError ? retryLogin : startLogin}
              disabled={isRetrying}
              className="w-full"
              size="lg"
            >
              <Lock className="mr-2 h-4 w-4" />
              {isRetrying ? 'Signing in...' : hasError ? 'Try Again' : 'Sign In'}
            </Button>

            {hasError && (
              <Button
                onClick={handleClearAndReload}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Session & Reload
              </Button>
            )}

            <p className="text-xs text-center text-muted-foreground">
              Secure authentication powered by Internet Identity
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content when authenticated
  return <>{children}</>;
}
