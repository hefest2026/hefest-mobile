/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/events/use-events-feed', () => ({ useEventsFeed: jest.fn() }));
jest.mock('@/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { push: jest.fn() },
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import EventsFeedScreen, { AccountButton } from '@/app/(app)/events/index';
import { useAuth } from '@/auth/auth-context';
import { useEventsFeed } from '@/events/use-events-feed';
import type { EventResponse } from '@/events/types';

const useEventsFeedMock = useEventsFeed as jest.Mock;
const useAuthMock = useAuth as jest.Mock;
const logout = jest.fn();

const event: EventResponse = {
  id: 'e1',
  organizer_id: 'org',
  title: 'Robotics Fair',
  description: 'A great event',
  starts_at: '2026-07-05T09:00:00Z',
  ends_at: null,
  location: 'Main Hall',
  capacity: 10,
  confirmed_count: 3,
  status: 'published',
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({ logout });
});

function baseFeed(overrides: Partial<ReturnType<typeof useEventsFeed>> = {}) {
  return {
    events: [],
    isLoading: false,
    isError: false,
    isRefetching: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('EventsFeedScreen', () => {
  it('shows the skeleton while loading', () => {
    useEventsFeedMock.mockReturnValue(baseFeed({ isLoading: true }));
    render(<EventsFeedScreen />);
    expect(screen.getAllByTestId('feed-skeleton-card').length).toBeGreaterThan(0);
  });

  it('shows an error state with retry', () => {
    const refetch = jest.fn();
    useEventsFeedMock.mockReturnValue(baseFeed({ isError: true, refetch }));
    render(<EventsFeedScreen />);
    fireEvent.press(screen.getByText('Try again'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when there are no published events', () => {
    useEventsFeedMock.mockReturnValue(baseFeed());
    render(<EventsFeedScreen />);
    expect(screen.getByText('No events yet')).toBeTruthy();
  });

  it('renders event cards', () => {
    useEventsFeedMock.mockReturnValue(baseFeed({ events: [event] }));
    render(<EventsFeedScreen />);
    expect(screen.getByText('Robotics Fair')).toBeTruthy();
  });
});

describe('AccountButton', () => {
  it('calls logout on tap', async () => {
    logout.mockResolvedValueOnce(undefined);
    render(<AccountButton />);
    fireEvent.press(screen.getByLabelText('Account'));
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });
});
