import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from '@/components/text-field';

describe('TextField', () => {
  it('renders label and forwards text changes', () => {
    const onChangeText = jest.fn();
    render(<TextField label="Email" value="" onChangeText={onChangeText} />);
    expect(screen.getByText('Email')).toBeTruthy();
    fireEvent.changeText(screen.getByDisplayValue(''), 'a@b.com');
    expect(onChangeText).toHaveBeenCalledWith('a@b.com');
  });

  it('shows inline error text when provided', () => {
    render(<TextField label="Email" value="" error="Email is required." />);
    expect(screen.getByText('Email is required.')).toBeTruthy();
  });

  it('hides the error slot when there is no error', () => {
    render(<TextField label="Email" value="x" error={null} />);
    expect(screen.queryByText('Email is required.')).toBeNull();
  });
});
