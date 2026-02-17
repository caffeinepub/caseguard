/**
 * Utility to clear Internet Identity / AuthClient cached storage.
 * Used during retry/recovery flows to clear stale authentication state.
 */

const AUTH_STORAGE_KEYS = [
  'ic-identity',
  'ic-delegation',
  'ic-identity-delegation',
  'identity',
  'delegation',
  'ic-keyval',
  'ic-keyval-store',
  'authClient',
  'auth-client-db',
];

/**
 * Clear known Internet Identity and AuthClient storage keys.
 * Best-effort cleanup that won't throw errors.
 */
export function clearAuthClientStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    // Clear known auth-related keys
    AUTH_STORAGE_KEYS.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore individual key errors
      }
    });

    // Also clear any keys that look like they might be auth-related
    const allKeys = Object.keys(window.localStorage);
    allKeys.forEach((key) => {
      if (
        key.includes('identity') ||
        key.includes('delegation') ||
        key.includes('auth') ||
        key.includes('ic-') ||
        key.includes('icp-') ||
        key.includes('dfinity')
      ) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // Ignore individual key errors
        }
      }
    });

    // Try to clear IndexedDB auth-related databases
    try {
      if (window.indexedDB) {
        // Common auth-related database names
        const dbNames = ['auth-client-db', 'ic-keyval'];
        dbNames.forEach((dbName) => {
          try {
            window.indexedDB.deleteDatabase(dbName);
          } catch {
            // Ignore individual database errors
          }
        });
      }
    } catch {
      // Ignore IndexedDB errors
    }
  } catch {
    // Fail silently - this is best-effort cleanup
  }
}
