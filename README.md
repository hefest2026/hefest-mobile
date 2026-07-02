# hefest-mobile — EventHub

Mobile client for **EventHub / Hefest**, a school events & workshops platform. This app is a
React Native (Expo) port of the `hefest-frontend` web app — same features, same Bulgarian UI,
built for iOS, Android, and web from a single codebase.

## Features

- **Login / Sign up** — email + password and social sign-in buttons (mock auth).
- **Role picker** — after signing in, continue as an **Organizer** or a **Student**.
- **Organizer area** (bottom tabs):
  - *Панел* — create / edit / delete draft events, then publish them through a confirmation dialog.
  - *Събития* — the platform-wide feed of published events (yours vs. others).
  - *Акаунт* — profile & security settings.
- **Student area** (bottom tabs):
  - *Събития* — browse published events, register, join the waitlist when full, or cancel
    (cancelling promotes the first waitlisted student).
  - *Акаунт* — profile & security settings.
- **Terms** and **Privacy** legal pages.
- Light/dark theme that follows the system color scheme.

> **Data:** the app runs entirely on **in-memory mock data** (a React context store seeded with
> sample events), mirroring the web app. There is no backend/network call yet — the documented
> `hefest-api` integration (JWT, push, etc.) is future work.

## Stack

- **Expo SDK 54** (Expo Go) + **Expo Router** (file-based routing under `src/app/`)
- **React Native 0.81** · **React 19.1** · **TypeScript 5.9**
- Navigation via `expo-router` `Stack` + `Tabs`; theme APIs come from `@react-navigation/native`
- State via React Context (`session`, `events`) — no Redux, no server state library yet
- Package manager: **npm**

## Project structure

```
src/
  app/                     # Expo Router routes (file = screen)
    _layout.tsx            # Root Stack + providers (theme, session, events)
    index.tsx              # Login
    signup.tsx             # Sign up
    role.tsx               # Organizer / Student picker
    terms.tsx, privacy.tsx # Legal pages
    organizer/             # Organizer bottom tabs
      _layout.tsx          #   tabs shell
      index.tsx            #   create/publish drafts + your published events
      all-events.tsx       #   platform-wide feed
      account.tsx          #   account
    student/               # Student bottom tabs
      _layout.tsx          #   tabs shell
      index.tsx            #   published events feed (register/waitlist/cancel)
      account.tsx          #   account
  components/
    ui/                    # Button, Card, Input, Textarea, Field, Separator, Badge, TextLink
    brand-header.tsx, account-tab.tsx, legal-page.tsx
    event-form.tsx, event-card.tsx, publish-confirmation.tsx
  context/                 # session (mock auth) + events (mock store) providers
  constants/theme.ts       # color palette (light/dark), spacing, radius
  hooks/                   # use-color-scheme, use-theme
  lib/                     # types.ts, format.ts (date/time helpers)
assets/                    # icons & splash
```

## Getting started

```bash
npm install
npm start          # Expo dev server — scan the QR with Expo Go
npm run android    # open on an Android emulator/device
npm run ios        # open on an iOS simulator/device
npm run web        # run in a browser
npm run lint       # expo lint (ESLint)
npx tsc --noEmit   # type-check
```
