@AGENTS.md

# hefest-mobile

School Events & Notification Center — AIBEST 2026 Burgas. Mobile client for the hefest-api backend.

## Stack

- **Expo SDK 56** + **Expo Router** (file-based routing, `src/app/`)
- **React Native 0.85** · **React 19** · **TypeScript 6**
- **react-native-reanimated 4** + **react-native-gesture-handler** for animations
- Package manager: **npm** (not yarn/pnpm/bun)

## Project layout

```
src/
  app/           # Expo Router screens (file = route)
    _layout.tsx  # Root layout / navigation shell
    index.tsx    # Event feed (home)
  components/    # Shared UI components
  constants/     # theme.ts — colors, spacing
  hooks/         # use-color-scheme, use-theme
assets/          # Icons, splash, images
```

## Backend (hefest-api)

Contract verified against `openapi.json` — endpoints differ from earlier assumptions.

- Base URL (local dev): `http://localhost:8000`
- **Auth (JWT Bearer):**
  - `POST /register` — body `{ full_name, email, password }`; creates an **unverified** account, returns no tokens.
  - `POST /auth/verify-email` — body `{ token }`; activates the account and returns `TokenResponse`. **Email verification is mandatory** before login works.
  - `POST /login` — body `{ email, password }` → `TokenResponse { access_token, expires_in }`.
  - `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`.
  - SSO available but out of scope for now: `/auth/google/login`, `/auth/microsoft/login`.
- **Refresh-token gotcha:** `TokenResponse` carries only `access_token`. The refresh token is set as an httpOnly cookie (`hefest_refresh`) and `/auth/refresh` reads it from the cookie — unusable from React Native. Mobile needs `refresh_token` in the body; tracked in **HEF-44** (blocks auth refresh).
- **Events (auth required):** `GET /events?limit=&offset=` returns a **bare array** of `EventResponse` (no envelope/total); paginate with `useInfiniteQuery` keyed on offset. `GET /events/{id}` → `EventDetailResponse` (adds `confirmed_count`, `waitlist_count`). `status` ∈ `draft|published|cancelled`, no server filter — filter client-side.
- **Push device endpoints do not exist yet** — `/devices/register` + `/devices/unregister` are tracked in **HEF-45** (blocks HEF-43).
- Tokens stored in **expo-secure-store** (never AsyncStorage for auth)

## Key decisions

- Expo Router for navigation — use `src/app/` file conventions, typed routes enabled
- **No redux** — use React Query for server state, React context for auth session
- Push notifications via **expo-notifications** + Expo Push API (not FCM/APNs directly)
- `react-native-reanimated` 4 uses the new Worklets API — check SDK 56 docs before animating

## Dev commands

```bash
npm start          # Start Expo dev server (scan QR with Expo Go)
npm run android    # Launch on Android emulator
npm run web        # Run in browser
npm run lint       # expo lint
```

## Jira tickets

| Key | Scope |
|-----|-------|
| HEF-41 | Auth — register, email verification, login (blocked by HEF-44) |
| HEF-42 | Event feed screen |
| HEF-43 | Push notifications via Expo Push (blocked by HEF-45) |
| HEF-44 | [api] Return `refresh_token` in body for mobile clients |
| HEF-45 | [api] Device / Expo push-token registration endpoints |

## GitHub

Repo: `hefest2026/hefest-mobile` (private)
Branch workflow: feature branches → PR → merge to main (same as hefest-api).
