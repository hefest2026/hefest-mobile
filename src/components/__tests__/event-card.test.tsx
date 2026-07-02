/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { EventCard } from '@/components/event-card';
import type { EventResponse } from '@/events/types';

const baseEvent: EventResponse = {
  id: 'e1',
  organizer_id: 'org',
  title: 'Robotics Fair',
  description: 'A '.repeat(80) + 'long description that should be truncated to two lines.',
  starts_at: '2026-07-05T09:00:00Z',
  ends_at: null,
  location: 'Main Hall',
  capacity: 10,
  confirmed_count: 3,
  status: 'published',
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
};

describe('EventCard', () => {
  it('renders title, location, and formatted date with a null ends_at', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('Robotics Fair')).toBeTruthy();
    expect(screen.getByText('Main Hall')).toBeTruthy();
    expect(screen.getByText('Jul 5, 2026, 12:00 PM')).toBeTruthy();
  });

  it('shows spots remaining as capacity minus confirmed_count', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('7 spots left')).toBeTruthy();
  });

  it('shows Unlimited when capacity is 0', () => {
    render(<EventCard event={{ ...baseEvent, capacity: 0 }} />);
    expect(screen.getByText('Unlimited')).toBeTruthy();
  });

  it('truncates description to two lines', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText(baseEvent.description).props.numberOfLines).toBe(2);
  });

  it('navigates to the detail screen on tap', () => {
    render(<EventCard event={baseEvent} />);
    fireEvent.press(screen.getByRole('button'));
    expect(router.push).toHaveBeenCalledWith(`/events/${baseEvent.id}`);
  });
});
