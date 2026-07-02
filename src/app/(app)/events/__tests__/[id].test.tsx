/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/events/use-event', () => ({ useEvent: jest.fn() }));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: jest.fn(),
  router: { back: jest.fn() },
}));

import { render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import EventDetailScreen from '@/app/(app)/events/[id]';
import type { EventDetailResponse } from '@/events/types';
import { useEvent } from '@/events/use-event';

const useEventMock = useEvent as jest.Mock;
const useLocalSearchParamsMock = useLocalSearchParams as jest.Mock;

const detail: EventDetailResponse = {
  id: 'e1',
  organizer_id: 'org',
  title: 'Robotics Fair',
  description: 'Full description of the robotics fair.',
  starts_at: '2026-07-05T09:00:00Z',
  ends_at: null,
  location: 'Main Hall',
  capacity: 10,
  confirmed_count: 3,
  status: 'published',
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
  waitlist_count: 4,
  organizer_name: 'Ada Lovelace',
};

beforeEach(() => {
  jest.clearAllMocks();
  useLocalSearchParamsMock.mockReturnValue({ id: 'e1' });
});

function baseQuery(overrides: Partial<ReturnType<typeof useEvent>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('EventDetailScreen', () => {
  it('shows a centered spinner on a cold deep-link with no seed', () => {
    useEventMock.mockReturnValue(baseQuery({ isLoading: true }));
    render(<EventDetailScreen />);
    expect(screen.getByTestId('detail-loading')).toBeTruthy();
  });

  it('shows an error state with a go-back action', () => {
    useEventMock.mockReturnValue(baseQuery({ isError: true }));
    render(<EventDetailScreen />);
    expect(screen.getByText('Go back')).toBeTruthy();
  });

  it('renders full event fields', () => {
    useEventMock.mockReturnValue(baseQuery({ data: detail }));
    render(<EventDetailScreen />);
    expect(screen.getByText('Robotics Fair')).toBeTruthy();
    expect(screen.getByText('Full description of the robotics fair.')).toBeTruthy();
    expect(screen.getByText('Main Hall')).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('3 / 10 confirmed')).toBeTruthy();
  });

  it('shows the waitlist count only when greater than zero', () => {
    useEventMock.mockReturnValue(baseQuery({ data: detail }));
    render(<EventDetailScreen />);
    expect(screen.getByText('4 on waitlist')).toBeTruthy();
  });

  it('hides the waitlist line when waitlist_count is zero', () => {
    useEventMock.mockReturnValue(baseQuery({ data: { ...detail, waitlist_count: 0 } }));
    render(<EventDetailScreen />);
    expect(screen.queryByText(/on waitlist/)).toBeNull();
  });
});
