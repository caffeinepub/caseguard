/**
 * Opt-in diagnostics utility for auth lifecycle and navigation debugging.
 * Disabled by default; enable via localStorage flag: localStorage.setItem('AUTH_DEBUG', 'true')
 */

const AUTH_DEBUG_KEY = 'AUTH_DEBUG';

function isDebugEnabled(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    return window.localStorage.getItem(AUTH_DEBUG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function logAuthLifecycle(event: string, details?: Record<string, any>): void {
  if (!isDebugEnabled()) return;

  const timestamp = new Date().toISOString();
  const sanitizedDetails = details ? sanitizeDetails(details) : {};
  
  console.log(`[AUTH ${timestamp}] ${event}`, sanitizedDetails);
}

export function logNavigation(event: string, details?: Record<string, any>): void {
  if (!isDebugEnabled()) return;

  const timestamp = new Date().toISOString();
  const sanitizedDetails = details ? sanitizeDetails(details) : {};
  
  console.log(`[NAV ${timestamp}] ${event}`, sanitizedDetails);
}

/**
 * Remove sensitive data from log details
 */
function sanitizeDetails(details: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(details)) {
    // Skip sensitive fields
    if (
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('delegation') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('key')
    ) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Handle identity objects
    if (key === 'identity' && value) {
      sanitized[key] = {
        isAnonymous: value.getPrincipal?.()?.isAnonymous?.() ?? 'unknown',
        principalText: value.getPrincipal?.()?.toText?.() 
          ? value.getPrincipal().toText().substring(0, 10) + '...' 
          : 'unknown'
      };
      continue;
    }

    // Handle principal objects
    if (key === 'principal' && value) {
      const principalText = value.toText?.();
      sanitized[key] = principalText ? principalText.substring(0, 10) + '...' : String(value);
      continue;
    }

    // Copy safe primitives
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
      continue;
    }

    // Stringify objects safely
    try {
      sanitized[key] = JSON.stringify(value);
    } catch {
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

export function enableAuthDebug(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(AUTH_DEBUG_KEY, 'true');
      console.log('[AUTH] Debug logging enabled. Reload to see logs.');
    }
  } catch {
    console.warn('[AUTH] Could not enable debug logging');
  }
}

export function disableAuthDebug(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(AUTH_DEBUG_KEY);
      console.log('[AUTH] Debug logging disabled.');
    }
  } catch {
    console.warn('[AUTH] Could not disable debug logging');
  }
}
