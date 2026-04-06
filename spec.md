# Adifundbroker Dashboard

## Current State
The Internet Identity login button does not respond to clicks in many browsers/sessions. The root cause is in `useInternetIdentity.ts`: the `useEffect` that initializes the `AuthClient` lists `authClient` (a state variable) in its dependency array. Every time the effect runs, it calls `setAuthClient(existingClient)`, which updates the state, which triggers the effect again — creating an infinite re-initialization loop. The status is continuously reset to `"initializing"` and `"idle"`, and `authClientRef` is never stably available for the `login` function to use.

## Requested Changes (Diff)

### Add
- `useRef` to store `authClient` instead of `useState`, preventing re-render cycles
- `initializingRef` guard to prevent double-initialization in React Strict Mode
- Re-init logic in `clear()` so a fresh auth client is ready after logout

### Modify
- `useInternetIdentity.ts`: Move `authClient` from `useState` to `useRef`. Remove `authClient` from the `useEffect` dependency array. Change the init effect to run exactly once on mount. Update `login`, `handleLoginSuccess`, and `clear` to read from `authClientRef.current`.

### Remove
- `authClient` state variable (replaced by `authClientRef`)
- `authClient` from `useEffect` deps (was the source of the infinite loop)

## Implementation Plan
1. Rewrite `useInternetIdentity.ts` with `useRef<AuthClient | null>` replacing `useState<AuthClient>`
2. Set `initializingRef.current = true` at the start of the init effect to prevent double-runs
3. Make the init `useEffect` have empty deps `[]` so it runs exactly once on mount
4. Update `login` to read `authClientRef.current` instead of the old state variable
5. Update `handleLoginSuccess` to read `authClientRef.current`
6. In `clear()`, after logout, create a fresh `AuthClient` and assign it to `authClientRef.current` so the login button works after logout
7. Validate build
