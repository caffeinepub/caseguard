/**
 * Converts unknown error-like values into stable, human-readable strings for UI rendering.
 * Prevents React error #301 by ensuring no plain objects are rendered as JSX.
 * Handles nested message fields, non-Error throwables, empty/whitespace strings, and circular objects.
 */
export function normalizeAuthError(error: unknown): string {
  // Null/undefined
  if (error == null) {
    return 'Authentication failed. Please try again.';
  }

  // String error - trim and validate
  if (typeof error === 'string') {
    const trimmed = error.trim();
    return trimmed || 'Authentication failed. Please try again.';
  }

  // Error object with message
  if (error instanceof Error) {
    const msg = error.message?.trim();
    return msg || 'Authentication failed. Please try again.';
  }

  // Object with message property (check multiple levels)
  if (typeof error === 'object') {
    // Try direct message property
    if ('message' in error) {
      const msg = (error as any).message;
      if (typeof msg === 'string') {
        const trimmed = msg.trim();
        if (trimmed) return trimmed;
      }
      // Nested message.message
      if (msg && typeof msg === 'object' && 'message' in msg) {
        const nestedMsg = (msg as any).message;
        if (typeof nestedMsg === 'string') {
          const trimmed = nestedMsg.trim();
          if (trimmed) return trimmed;
        }
      }
    }

    // Try error property
    if ('error' in error) {
      const err = (error as any).error;
      if (typeof err === 'string') {
        const trimmed = err.trim();
        if (trimmed) return trimmed;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        const errMsg = (err as any).message;
        if (typeof errMsg === 'string') {
          const trimmed = errMsg.trim();
          if (trimmed) return trimmed;
        }
      }
    }

    // Try to stringify safely (with circular reference protection)
    try {
      const stringified = JSON.stringify(error, null, 2);
      if (stringified && stringified !== '{}' && stringified !== 'null') {
        // Limit length to prevent huge error messages
        const limited = stringified.length > 200 
          ? stringified.substring(0, 200) + '...' 
          : stringified;
        return `Authentication error: ${limited}`;
      }
    } catch (stringifyError) {
      // Handle circular references or other stringify errors
      try {
        // Try toString as fallback
        const str = String(error);
        if (str && str !== '[object Object]') {
          return `Authentication error: ${str}`;
        }
      } catch {
        // Ignore toString errors
      }
    }
  }

  // Number, boolean, or other primitive
  if (typeof error === 'number' || typeof error === 'boolean') {
    return `Authentication error: ${String(error)}`;
  }

  // Final fallback
  return 'Authentication failed. Please try again.';
}
