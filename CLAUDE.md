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

- Base URL (local dev): `http://localhost:8000`
- Auth: JWT Bearer — `POST /auth/login`, `POST /auth/register`
- Events: `GET /events` (paginated), `GET /events/{id}`
- Devices: `POST /devices/register`, `POST /devices/unregister` (push tokens)
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
| HEF-41 | Auth screens — login & register |
| HEF-42 | Event feed screen |
| HEF-43 | Push notifications via Expo Push |

## GitHub

Repo: `hefest2026/hefest-mobile` (private)
Branch workflow: feature branches → PR → merge to main (same as hefest-api).
