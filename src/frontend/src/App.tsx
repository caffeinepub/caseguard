import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AppErrorBoundary } from './components/errors/AppErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import RequireAuth from './components/auth/RequireAuth';
import DashboardPage from './pages/DashboardPage';
import CaseDetailPage from './pages/CaseDetailPage';
import CaseEditPage from './pages/CaseEditPage';
import IntegrationsPage from './pages/IntegrationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <RequireAuth>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </RequireAuth>
  ),
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

// Case detail route
const caseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/case/$caseNumber',
  component: CaseDetailPage,
});

// Case edit route (new case)
const caseNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/case/new',
  component: CaseEditPage,
});

// Case edit route (existing case)
const caseEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/case/$caseNumber/edit',
  component: CaseEditPage,
});

// Integrations route
const integrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations',
  component: IntegrationsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  caseDetailRoute,
  caseNewRoute,
  caseEditRoute,
  integrationsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <InternetIdentityProvider>
            <RouterProvider router={router} />
            <Toaster />
          </InternetIdentityProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
