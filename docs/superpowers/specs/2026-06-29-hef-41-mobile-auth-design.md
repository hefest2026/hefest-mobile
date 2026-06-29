# HEF-41 — Mobile Authentication (hefest-mobile)

**Date:** 2026-06-29
**Repo:** `hefest2026/hefest-mobile` (Expo SDK 56 · RN 0.85 · Expo Router · TypeScript)
**Story:** HEF-41 — register → email verification → login, with session persistence and SSO.

---

## 1. Goal

Build the complete authentication surface for the mobile app and the reusable
foundation the rest of the app depends on: an HTTP layer that owns token
mechanics, a session context, a guarded navigation shell, and the auth screens
themselves (email/password and SSO). The events feed (HEF-42) and push
(HEF-43) drop into this shell with no rework.

## 2. Backend contract (authoritative, from `main`)

Mobile sends `X-Client-Id: mobile_app` on auth requests so the refresh token is
delivered **in the response body** (web continues to use the httpOnly cookie).

| Endpoint | Body | Returns | Notes |
|----------|------|---------|-------|
| `POST /register` | `{full_name, email, password}` | `201 {message}` (+ `verify_token` when `env==dev`) | `409 email_exists`. Password **min 12 chars**. No tokens. |
| `POST /auth/verify-email` | `{token}` | `TokenResponse` | `400 invalid_verify_token`. Activates account, issues tokens. |
| `POST /login` | `{email, password}` | `TokenResponse` | `401 invalid_credentials`, `403 email_not_verified`. |
| `POST /auth/refresh` | `{refresh_token}` | rotated `TokenResponse` | `401 token_reuse_detected` → hard logout. New refresh token must replace stored one. |
| `POST /auth/logout` | `{refresh_token}` | `204` | Revokes the held token. |
| `GET /users/me` | — (Bearer) | `UserMeResponse` | Profile of current user. |
| `GET /auth/providers` | — | `{password:{available}, providers:[…]}` | Which auth methods are enabled. |
| `GET /auth/{provider}/login` → callback | — | redirect | OAuth flow; see §9 + HEF-47. |

`TokenResponse = { access_token: string, token_type: "bearer", expires_in: number, refresh_token: string | null }`.
`refresh_token` is populated only for mobile clients.

**Verification token** is a long JWT embedded in the email link. The email link
points at the **web** frontend (`email_verify_url`, default
`http://localhost:5173/verify-email?token=`), not the mobile app. In `dev`,
`/register` returns the `verify_token` directly so the app can verify without
email. See §6 and Dependencies.

## 3. Architecture

Three independently testable layers:

- **HTTP layer** (`src/api/`) — a single axios instance whose interceptors own
  all token logic. Nothing above it knows about tokens or refresh.
- **Auth domain** (`src/auth/`) — token persistence, typed endpoint calls, and
  an `AuthContext` exposing session state and actions.
- **UI** (`src/app/`) — Expo Router route groups; screens call `useAuth()` and
  React Query, never axios directly.

### Module layout

```
src/
  app/
    _layout.tsx            # QueryClientProvider + AuthProvider + <Slot/>; redirects on session state
    (auth)/
      _layout.tsx          # Stack for signed-out screens
      login.tsx
      register.tsx
    (app)/
      _layout.tsx          # authed shell (Tabs); home placeholder for HEF-42 feed
      index.tsx            # "Signed in" placeholder + logout action
    verify-email.tsx       # deep-link target: hefestmobile://verify-email?token=...
  api/
    client.ts              # axios instance + request/response interceptors
    query-client.ts        # React Query client
  auth/
    auth-context.tsx       # AuthProvider, useAuth(): {status, user, login, register, verify, loginWithSso, logout}
    token-store.ts         # SecureStore for refresh_token; in-memory access token + expiry
    auth-api.ts            # register / verifyEmail / login / refresh / logout / me / providers
    sso.ts                 # openAuthSessionAsync flow + callback fragment parse
    errors.ts              # X-Error-Code -> friendly message map
  components/
    button.tsx             # primary/secondary/loading/disabled states
    text-field.tsx         # labelled input + inline error
    form-banner.tsx        # request-level error/success banner
    screen-container.tsx   # safe-area + keyboard-avoiding auth layout
  types/auth.ts            # TokenResponse, RegisterRequest, LoginRequest, UserMe, ProvidersResponse
```

### Token placement (security)

- `refresh_token` → **`expo-secure-store`** (survives restarts).
- Access token + its expiry → **in-memory only** (module-scoped in
  `token-store`), never persisted. On cold start there is no access token, so
  bootstrap always derives one from the stored refresh token.
- `X-Client-Id: mobile_app` is attached globally by the request interceptor.

## 4. Navigation & guarding (full guarded shell)

- Root `_layout.tsx` mounts providers and a `<Slot/>`, then reads
  `auth.status` ∈ `bootstrapping | signedOut | signedIn`:
  - `bootstrapping` → splash (reuse existing `AnimatedSplashOverlay`).
  - `signedOut` → redirect into `(auth)`.
  - `signedIn` → redirect into `(app)`.
- `verify-email.tsx` sits **outside** both groups so the deep link resolves
  whether or not a session exists; on success the root redirect pulls the user
  into `(app)`.
- The starter `index`/`explore` tabs are replaced by `(app)/index.tsx`
  (placeholder home + logout), where HEF-42's feed will land.

## 5. Session model

- **Cold start (bootstrap):** read refresh token from SecureStore; if present →
  `POST /auth/refresh` → persist rotated pair → `signedIn`; else `signedOut`.
- **Preemptive refresh:** the request interceptor checks the access token's
  expiry (from `expires_in`, minus a ~30s skew buffer); if due/absent and a
  refresh token exists, it awaits a **single shared** in-flight refresh promise
  before sending the request.
- **401 safety net:** the response interceptor catches a 401 (except on the
  refresh call itself) → one shared refresh → retry the original request. The
  user never sees the 401.
- **Hard logout:** any refresh returning `token_reuse_detected` (or otherwise
  failing) → wipe SecureStore + in-memory token + `queryClient.clear()` →
  redirect to login.
- **Explicit logout:** `POST /auth/logout {refresh_token}` → same wipe.

## 6. Auth flows

- **Register** → `POST /register`. `201`: in **dev** the body carries
  `verify_token` → auto-navigate to `verify-email` with it (no email needed).
  Otherwise → a "check your email" pending screen. `409 email_exists` → inline
  field error.
- **Verify** → `POST /auth/verify-email {token}` (+`X-Client-Id`) →
  `TokenResponse` → persist → enter app. `400 invalid_verify_token` → error
  screen with a path back to register. Reached via dev auto-verify **or** the
  `hefestmobile://verify-email?token=` deep link (staging email; see
  Dependencies).
- **Login** → `POST /login` → `TokenResponse` → persist → app.
  `401 invalid_credentials` / `403 email_not_verified` → mapped messages.

## 7. Error handling & validation

- **Server errors** → `errors.ts` maps the `X-Error-Code` response header to
  friendly copy:
  - `email_exists` → "That email is already registered."
  - `invalid_credentials` → "Email or password is incorrect."
  - `email_not_verified` → "Please verify your email — check your inbox."
    *(resend tracked in HEF-46)*
  - `invalid_verify_token` → "This verification link is invalid or expired."
  - `token_reuse_detected` → silent session wipe + "You've been signed out,
    please log in again."
  - unknown / network → generic fallback.
- **Client validation** (inline, no extra dependency): trimmed non-empty email
  matching a basic email regex; password **min 12 chars** (mirrors backend);
  submit disabled until valid; per-field error text in the `destructive` color.
- Field errors render under inputs; request-level errors in a dismissible
  banner. No error is ever silently swallowed.

## 8. Visual direction

Anchored to the web app's palette (shadcn / oklch): a warm **amber primary**
(`oklch(0.555 0.163 49)`) on a neutral stone scale, with full light/dark sets.
The mobile `constants/theme.ts` already has a neutral light/dark structure —
**extend it, do not replace it**:

- Add a `brand` (amber) ramp + `destructive` to both `Colors.light` and
  `Colors.dark`, keeping the existing neutral surface/text tokens.
- **Usage:** amber for primary CTAs, links, focus/active rings, active tab;
  neutrals for surfaces and text; `destructive` for errors.
- **Polish:** rounded inputs/buttons (~10px, matching the web's `--radius`),
  comfortable `Spacing` rhythm, a single-column card-centered auth layout,
  `KeyboardAvoidingView`, explicit pressed/disabled/loading states, and light
  entrance transitions via the already-installed `react-native-reanimated`.
  Respects system light/dark via the existing `useColorScheme`.

No heavy component library: build a small set of components
(`Button`, `TextField`, `FormBanner`, `ScreenContainer`) on the theme, using
`@expo/ui` natives where they help. This keeps dependencies lean and gives the
tightest match to the web look.

## 9. SSO (Google / Microsoft)

- **Provider discovery:** `GET /auth/providers`. Login and register screens
  render a "Continue with {provider}" button **per enabled provider**, below the
  email/password form with an "or" divider. Disabled providers are not shown.
- **Flow:** `WebBrowser.openAuthSessionAsync('<API>/auth/{provider}/login',
  'hefestmobile://auth/callback')`. The system browser walks API → provider →
  API callback, which (per **HEF-47**) redirects to
  `hefestmobile://auth/callback#access_token=…&refresh_token=…`.
  `openAuthSessionAsync` resolves with that URL.
- **Token handling:** parse the fragment, then reuse the **same** `token-store`
  path as password login (refresh → SecureStore, access+expiry → memory) →
  `AuthContext` flips to `signedIn`. No dedicated callback screen needed;
  `hefestmobile://auth/callback` only needs registering as the return URL.
- **Dependencies:** `expo-web-browser` and `expo-linking` are already present —
  **no new runtime dependency**.
- **Status:** the UI is built against HEF-47's target contract. Provider buttons
  and flow launch are dev-testable now; the full round-trip is **blocked by
  HEF-47** and is non-blocking for the rest of HEF-41.

## 10. Testing (target ≥ 80%)

`jest-expo` + `@testing-library/react-native`. SecureStore and the network are
mocked.

- **Unit:** `token-store` (persist/clear, in-memory access+expiry);
  preemptive-refresh decision (expiry − skew); the single shared in-flight
  refresh (concurrent 401s trigger one refresh); response-interceptor
  401 → refresh → retry, and `token_reuse_detected` → wipe; `errors.ts`
  mapping; `auth-context` state transitions; SSO callback fragment parse.
- **Component:** login & register validation + submit states
  (loading/disabled/error); dev auto-verify branch; deep-link `verify-email`
  token consumption (mock `expo-linking` params); SSO provider buttons render
  from a mocked providers response and hide when disabled (mock
  `openAuthSessionAsync`).
- The coverage output folder is added to `.gitignore`.

## 11. Dependencies & out of scope

**New dependencies**

- Runtime: `axios`, `@tanstack/react-query`, `expo-secure-store`.
- Dev: `jest-expo`, `jest`, `@testing-library/react-native`,
  `react-test-renderer`, `@types/jest`.

**Tracked external dependencies**

- **HEF-47** — `[api]` client-aware OAuth success redirect + mobile refresh
  delivery. **Blocks** the SSO round-trip end-to-end.
- **Staging email delivery** (separate infra task) — add the worker +
  mailpit to `compose.staging.yml` and set
  `HEFEST_EMAIL_VERIFY_URL=hefestmobile://verify-email`, so the verification
  email opens the mobile app and the deep-link verify path can be tested
  end-to-end. Not built in this story.
- **HEF-46** — `[api]` resend email-verification endpoint (backlog). Without it,
  a `403 email_not_verified` at login can only advise the user to check their
  inbox.

**Out of scope**

- Events feed (HEF-42), push notifications (HEF-43).
- Production universal/app links for the web-targeted verification email.
- Any backend implementation (HEF-46 / HEF-47 are backend tickets).

## 12. Acceptance criteria

- A new user can register, get verified (dev auto-verify or deep link), and land
  in the authenticated app.
- A returning user stays signed in across app restarts until the refresh token
  expires or reuse is detected.
- Access-token expiry mid-session is invisible to the user.
- Token-reuse detection forces a clean re-login.
- SSO provider buttons reflect `/auth/providers`; the SSO flow launches and
  (once HEF-47 lands) completes into a signed-in session.
- All error states show friendly, mapped messages; no silent failures.
- Tests pass with ≥ 80% coverage; `expo lint` is clean.
