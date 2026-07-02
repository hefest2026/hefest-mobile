/**
 * Shared date/time formatting for event cards and the detail screen, fixed
 * to the user's timezone (Europe/Sofia per the HEF-42 design). A same-day
 * range collapses to one date with a time span; otherwise both dates show.
 */

const TIME_ZONE = 'Europe/Sofia';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
});

function isSameDay(a: Date, b: Date): boolean {
  return dateFormatter.format(a) === dateFormatter.format(b);
}

/** Formats `starts_at`/`ends_at` (nullable) into a display date/time range. */
export function formatDateRange(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt);
  const startLabel = `${dateFormatter.format(start)}, ${timeFormatter.format(start)}`;

  if (endsAt === null) {
    return startLabel;
  }

  const end = new Date(endsAt);
  if (isSameDay(start, end)) {
    return `${startLabel} – ${timeFormatter.format(end)}`;
  }

  return `${startLabel} – ${dateFormatter.format(end)}, ${timeFormatter.format(end)}`;
}
