/**
 * SessionStorage-based utility to persist, retrieve, and clear the intended route
 * (pathname + search) for post-login redirect flow.
 * 
 * Includes normalization to prevent storing invalid routes.
 */

const INTENDED_ROUTE_KEY = 'intended_route';

/**
 * Normalize and validate a route path
 */
function normalizeRoute(pathname: string, search: string): string | null {
  // Trim whitespace
  const trimmedPath = pathname.trim();
  const trimmedSearch = search.trim();

  // Reject empty or invalid paths
  if (!trimmedPath || trimmedPath === '/') {
    return null;
  }

  // Ensure path starts with /
  const normalizedPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;

  // Combine path and search
  const fullRoute = normalizedPath + trimmedSearch;

  // Reject if it looks invalid
  if (fullRoute.length > 2000) {
    console.warn('[intendedRoute] Route too long, rejecting:', fullRoute.substring(0, 100));
    return null;
  }

  return fullRoute;
}

/**
 * Store the intended route (pathname + search) in sessionStorage
 */
export function setIntendedRoute(pathname: string, search: string = ''): void {
  try {
    const normalized = normalizeRoute(pathname, search);
    
    if (!normalized) {
      return;
    }

    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(INTENDED_ROUTE_KEY, normalized);
    }
  } catch (error) {
    console.warn('[intendedRoute] Failed to store intended route:', error);
  }
}

/**
 * Retrieve the intended route from sessionStorage
 */
export function getIntendedRoute(): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(INTENDED_ROUTE_KEY);
      return stored || null;
    }
    return null;
  } catch (error) {
    console.warn('[intendedRoute] Failed to retrieve intended route:', error);
    return null;
  }
}

/**
 * Clear the intended route from sessionStorage
 */
export function clearIntendedRoute(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(INTENDED_ROUTE_KEY);
    }
  } catch (error) {
    console.warn('[intendedRoute] Failed to clear intended route:', error);
  }
}

/**
 * Check if the current route matches the intended route
 */
export function isOnIntendedRoute(currentPathname: string, currentSearch: string): boolean {
  const intendedRoute = getIntendedRoute();
  if (!intendedRoute) {
    return false;
  }

  const currentRoute = currentPathname + currentSearch;
  return currentRoute === intendedRoute;
}
