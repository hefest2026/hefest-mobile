# HEF-42 — Mobile Event Feed — Design

**Repo:** `hefest2026/hefest-mobile` · **Status:** design approved, ready to plan
**Depends on:** HEF-41 (auth) — merged. Registration/waitlist actions are a separate ticket.

## Goal

Implement the authenticated event feed and event detail screens in hefest-mobile,
built against the **live** `hefest-api` contract (`openapi.json`, verified against a
running instance on 2026-07-01).

## Contract (authoritative, from live openapi.json)

`GET /events` — **auth required** (`Authorization: Bearer`). Query params `limit`
(1–500, default 100) and `offset`. Returns a **bare JSON array** of `EventResponse`
(no envelope, no total count).

`GET /events/{event_id}` — returns `EventDetailResponse`.

`EventResponse` fields:

| field | type | notes |
|-------|------|-------|
| `id` | string (uuid) | |
| `organizer_id` | string (uuid) | |
| `title` | string | |
| `description` | string | |
| `starts_at` | string (date-time) | |
| `ends_at` | string (date-time) \| **null** | nullable |
| `location` | string | |
| `capacity` | integer | `0` treated as "Unlimited" in UI |
| `confirmed_count` | integer (optional) | **present on the list** — enables spots-remaining on cards |
| `status` | `draft` \| `published` \| `cancelled` | no server-side filter param |
| `created_at` / `updated_at` | string (date-time) | |

`EventDetailResponse` = `EventResponse` **plus** `waitlist_count` (integer) and
`organizer_name` (string).

> Correction vs. the Jira ticket: the ticket assumed `confirmed_count` was
> detail-only. The live schema carries it on the list response, so list cards can
> show spots remaining without the detail round-trip.

## Product decisions

- **Filter:** show only `status === 'published'`. `draft` and `cancelled` are both
  hidden (client-side; the API has no filter param).
- **Logout/account:** a header button on the feed screen (single "Events" tab kept;
  no separate profile tab in this ticket).
- **Detail presentation:** nested Stack inside the Events tab — feed pushes detail on
  top, tab bar stays visible, native back.
- **Out of scope:** event registration / waitlist actions (`POST /events/{id}/registrations`,
  `GET /registrations/me`) — separate ticket.

## Architecture & file layout

Mirrors the `src/auth/` slice pattern: a self-contained `src/events/` feature with
presentational screens on top. The axios client (`src/api/client.ts`) already owns all
token mechanics — feature code only calls `apiClient.get`.

```
src/events/
  types.ts            # EventResponse, EventDetailResponse, EventStatus
  events-api.ts       # listEvents(limit, offset), getEvent(id)
  use-events-feed.ts  # useInfiniteQuery: pagination + published filter + auto-advance
  use-event.ts        # useQuery detail, seeded from feed cache
  __tests__/          # events-api.test.ts, use-events-feed.test.ts

src/components/
  event-card.tsx      # presentational card + __tests__
  list-states.tsx     # FeedSkeleton / EmptyState / ErrorState + __tests__

src/app/(app)/
  _layout.tsx         # Tabs shell (unchanged) — "Events" tab points at the stack
  events/
    _layout.tsx       # Stack: index (feed) -> [id] (detail)
    index.tsx         # feed screen (header account/logout button)
    [id].tsx          # detail screen
```

The old `(app)/index.tsx` logout placeholder is deleted; its logout logic moves into
the feed header button.

**New dependency:** `@shopify/flash-list` (SDK 56 / RN new-arch compatible), per the ticket.

## Data layer

**`events-api.ts`** — thin wrappers, no token logic:

```
listEvents(limit, offset) -> apiClient.get<EventResponse[]>('/events', { params: { limit, offset } })
getEvent(id)              -> apiClient.get<EventDetailResponse>(`/events/${id}`)
```

**`use-events-feed.ts`** — `useInfiniteQuery`:

- `queryKey: ['events']`, `initialPageParam: 0`, `queryFn` calls `listEvents(PAGE_SIZE, pageParam)`.
- `getNextPageParam`: advance by `PAGE_SIZE` **only when the raw page returned exactly
  `PAGE_SIZE` items**; return `undefined` (stop) on a short page. Pagination keys off
  **raw** server counts, never the filtered view.
- `PAGE_SIZE = 50`.
- Exposes a memoized, flattened `events` = all pages filtered to `status === 'published'`.
- **Auto-advance (client-filter/pagination trap):** a raw page of 50 may be entirely
  draft/cancelled → 0 visible rows while more pages exist. After a page settles, if
  `events.length === 0 && hasNextPage && !isFetchingNextPage`, call `fetchNextPage()`
  (in an effect). Prevents a falsely-empty feed. Normal `onEndReached` drives paging
  thereafter.

**`use-event.ts`** — `useQuery(['event', id], () => getEvent(id))`, with `initialData`
seeded from the `['events']` infinite cache when that id is already loaded (instant
paint; detail-only fields `waitlist_count`/`organizer_name` fill in on fetch). Inherits
the global 30s `staleTime`.

**Hard-logout interaction:** logout already calls `queryClient.clear()`, wiping the feed
cache with the session. Nothing to add.

## Feed screen (`events/index.tsx`)

- **Header:** Stack header "Events"; right-side account button (person icon) triggering
  the existing `logout()` flow (loading state while logging out).
- **List:** `FlashList` of `EventCard`s.
  - `onEndReached` -> `fetchNextPage()` (guarded by `hasNextPage && !isFetchingNextPage`).
  - Pull-to-refresh -> `refetch()`.
  - Footer spinner while `isFetchingNextPage`.
- **States** (`list-states.tsx`):
  - **Loading (first load):** `FeedSkeleton` — a few placeholder cards.
  - **Empty:** `success` + 0 published across all pages -> "No events yet".
  - **Error:** `error` -> `ErrorState` + "Try again" (`refetch()`). 401s never reach
    here — the axios layer refreshes or hard-logs-out.

## EventCard (presentational)

Themed tokens only. Fields: `title` (subtitle), formatted date/time range (**nullable
`ends_at`** -> show start only), `location`, spots remaining = `capacity - confirmed_count`
(`capacity === 0` -> "Unlimited"), truncated `description` (2 lines). Tap ->
`router.push('/events/[id]')`.

Date formatting via `Intl.DateTimeFormat` (user TZ Europe/Sofia); same-day range
collapses to one date with a time span.

## Detail screen (`events/[id].tsx`)

- `id` via `useLocalSearchParams`; drives `use-event`.
- Stack header, native back; title = event title (or "Event" while loading).
- Body: full (untruncated) `description`, formatted date/time range, `location`,
  `organizer_name`, and a spots block — `confirmed_count` / `capacity` with spots
  remaining, plus `waitlist_count` when `> 0` ("N on waitlist").
- Instant paint from seeded `initialData`; detail-only fields resolve on fetch.
- **Loading** (cold deep-link, no seed): centered spinner. **Error** (404/deleted):
  `ErrorState` + "Go back".

## Testing (jest-expo + RNTL, mock `apiClient`, >=60% coverage gate)

- `events-api.test.ts` — params sent; array/detail parsing.
- `use-events-feed.test.ts` — advance/stop on short page; published filter drops
  draft+cancelled; auto-advance when a full page yields 0 visible.
- `event-card.test.tsx` — nullable `ends_at`; spots math; `capacity === 0` -> "Unlimited".
- `list-states.test.tsx` — skeleton/empty/error render + retry callback.
- Screen tests — feed renders cards / empty / error+retry; detail renders fields and
  conditional waitlist.
