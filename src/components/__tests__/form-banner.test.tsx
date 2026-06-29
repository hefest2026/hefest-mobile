import { fireEvent, render, screen } from '@testing-library/react-native';

import { FormBanner } from '@/components/form-banner';

describe('FormBanner', () => {
  it('renders the message', () => {
    render(<FormBanner message="Email or password is incorrect." />);
    expect(screen.getByText('Email or password is incorrect.')).toBeTruthy();
  });

  it('calls onDismiss when the dismiss control is pressed', () => {
    const onDismiss = jest.fn();
    render(<FormBanner message="oops" onDismiss={onDismiss} />);
    fireEvent.press(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('omits the dismiss control without a handler', () => {
    render(<FormBanner message="oops" tone="success" />);
    expect(screen.queryByLabelText('Dismiss')).toBeNull();
  });
});
