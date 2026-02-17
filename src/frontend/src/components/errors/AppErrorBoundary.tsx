import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { clearAuthClientStorage } from '../../utils/authClientStorage';
import { normalizeAuthError } from '../../utils/normalizeAuthError';
import { logAuthLifecycle } from '../../utils/authDiagnostics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Application-level error boundary that catches runtime errors during rendering/routing.
 * Provides a fallback UI with recovery action that clears auth storage and reloads.
 */
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: unknown): State {
    // Normalize error to string-safe message
    const errorMessage = normalizeAuthError(error);
    
    logAuthLifecycle('Error boundary caught error', { message: errorMessage });
    
    return {
      hasError: true,
      errorMessage,
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('App Error Boundary caught an error:', error, errorInfo);
    logAuthLifecycle('Error boundary details', { 
      componentStack: errorInfo.componentStack?.substring(0, 200) 
    });
  }

  handleRecovery = () => {
    logAuthLifecycle('Error boundary recovery initiated');
    
    try {
      // Clear auth storage
      clearAuthClientStorage();
      
      // Clear any React Query cache in localStorage
      try {
        const allKeys = Object.keys(window.localStorage);
        allKeys.forEach((key) => {
          if (key.includes('react-query') || key.includes('tanstack')) {
            try {
              window.localStorage.removeItem(key);
            } catch {
              // Ignore individual key errors
            }
          }
        });
      } catch {
        // Ignore localStorage errors
      }

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Recovery error:', error);
      // Force reload even if cleanup fails
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Ensure error message is always a string (defensive check)
      const safeErrorMessage = typeof this.state.errorMessage === 'string'
        ? this.state.errorMessage
        : 'An unexpected error occurred. Please try again.';

      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
              <CardDescription>
                The application encountered an unexpected error. You can try to recover by clearing your session and reloading.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {safeErrorMessage}
                </AlertDescription>
              </Alert>

              <Button
                onClick={this.handleRecovery}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Session & Reload
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                This will clear your authentication and reload the application
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
