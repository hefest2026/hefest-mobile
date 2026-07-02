import { formatDateRange } from '@/events/format';

describe('formatDateRange', () => {
  it('shows only the start when ends_at is null', () => {
    expect(formatDateRange('2026-07-05T09:00:00Z', null)).toBe('Jul 5, 2026, 12:00 PM');
  });

  it('collapses a same-day range to one date with a time span', () => {
    expect(formatDateRange('2026-07-05T09:00:00Z', '2026-07-05T13:00:00Z')).toBe(
      'Jul 5, 2026, 12:00 PM – 4:00 PM',
    );
  });

  it('spans both dates when the range crosses a day boundary (in Europe/Sofia)', () => {
    // 22:30 Sofia (UTC+3 in July) on Jul 5 -> 00:30 Sofia on Jul 6.
    expect(formatDateRange('2026-07-05T19:30:00Z', '2026-07-05T21:30:00Z')).toBe(
      'Jul 5, 2026, 10:30 PM – Jul 6, 2026, 12:30 AM',
    );
  });
});
