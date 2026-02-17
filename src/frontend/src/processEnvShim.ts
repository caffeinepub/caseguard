/**
 * Process environment shim for Vite compatibility.
 * Ensures process.env exists and is populated from import.meta.env
 * to prevent initialization crashes in libraries expecting Node.js globals.
 * 
 * Production-ready with hardened II_URL resolution and validation.
 */

// Ensure global process object exists
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// Populate process.env from Vite's import.meta.env
if (typeof process !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) {
  // Copy all VITE_ prefixed variables
  Object.keys(import.meta.env).forEach((key) => {
    process.env[key] = import.meta.env[key];
  });

  // Ensure II_URL is available (critical for Internet Identity)
  // Priority: explicit VITE_II_URL > explicit II_URL > default fallback
  if (!process.env.II_URL && import.meta.env.VITE_II_URL) {
    process.env.II_URL = import.meta.env.VITE_II_URL;
  }

  // Fallback to default Internet Identity provider if not configured or blank
  if (!process.env.II_URL || process.env.II_URL.trim() === '') {
    process.env.II_URL = 'https://identity.ic0.app';
  }

  // Runtime validation for mainnet smoke testing
  const iiUrl = process.env.II_URL;
  const isProduction = import.meta.env.PROD;
  const mode = import.meta.env.MODE;

  // Non-sensitive logging for production debugging
  if (isProduction) {
    console.info('[CaseGuard] Environment initialized', {
      mode,
      iiUrlConfigured: !!iiUrl,
      iiUrlIsDefault: iiUrl === 'https://identity.ic0.app',
    });
  }

  // Validate II_URL format (basic check)
  if (iiUrl && !iiUrl.startsWith('http://') && !iiUrl.startsWith('https://')) {
    console.warn('[CaseGuard] II_URL does not start with http:// or https://, authentication may fail:', iiUrl);
  }
}

export {};
