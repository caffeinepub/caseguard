# Specification

## Summary
**Goal:** Eliminate the infinite render/redirect loop in the frontend authentication flow that triggers “Minified React error #301”, while preserving the intended post-login redirect behavior.

**Planned changes:**
- Scan `frontend/src` login/auth-related components, hooks, guards, and routing/redirection logic to pinpoint the exact source of repeated renders/state updates.
- Apply a targeted fix to stop repeated auth state updates/oscillation across the auth provider/hook stack (including `useInternetIdentity.ts` and `useAuthUi.ts`) so successful auth isn’t overwritten and failed logins don’t auto-retry.
- Stabilize protected-route handling so unauthenticated users see the auth screen without repeated redirects, and post-login redirects happen at most once and clear stored intended-route state.
- Add lightweight, opt-in developer diagnostics (guarded behind a simple flag) to log auth lifecycle transitions and navigation decisions without exposing sensitive data.

**User-visible outcome:** Users can navigate to protected routes, log in via Internet Identity, and land on the intended destination without crashes, repeated redirects, or unstable auth state; login failures stay on a stable error screen until the user retries.
