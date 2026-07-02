import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState, ErrorState, FeedSkeleton } from '@/components/list-states';

describe('list-states', () => {
  it('FeedSkeleton renders placeholder cards', () => {
    render(<FeedSkeleton />);
    expect(screen.getAllByTestId('feed-skeleton-card').length).toBeGreaterThan(0);
  });

  it('EmptyState renders the empty message', () => {
    render(<EmptyState />);
    expect(screen.getByText('No events yet')).toBeTruthy();
  });

  it('ErrorState renders a retry button that calls onRetry', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.press(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ErrorState accepts custom label and message', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} message="Not found" retryLabel="Go back" />);
    expect(screen.getByText('Not found')).toBeTruthy();
    expect(screen.getByText('Go back')).toBeTruthy();
  });
});
