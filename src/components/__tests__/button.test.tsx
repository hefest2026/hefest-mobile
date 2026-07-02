import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/components/button';

describe('Button', () => {
  it('fires onPress when enabled', () => {
    const onPress = jest.fn();
    render(<Button title="Sign in" onPress={onPress} />);
    fireEvent.press(screen.getByText('Sign in'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button title="Sign in" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Sign in'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner and blocks press while loading', () => {
    const onPress = jest.fn();
    render(<Button title="Sign in" onPress={onPress} loading />);
    expect(screen.queryByText('Sign in')).toBeNull();
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
