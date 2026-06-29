/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
const mockReplace = jest.fn();

jest.mock('@/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('@/components/sso-buttons', () => ({ SsoButtons: () => null }));
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useRouter: () => ({ replace: mockReplace }),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import RegisterScreen from '@/app/(auth)/register';
import { useAuth } from '@/auth/auth-context';

const useAuthMock = useAuth as jest.Mock;
const register = jest.fn();

function fillValidForm() {
  fireEvent.changeText(screen.getByLabelText('Full name'), 'Ada Lovelace');
  fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
  fireEvent.changeText(screen.getByLabelText('Password'), 'longpassword1');
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({ register });
});

describe('RegisterScreen', () => {
  it('validates all fields before submitting', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByText('Create account'));
    expect(screen.getByText('Name is required.')).toBeTruthy();
    expect(screen.getByText('Email is required.')).toBeTruthy();
    expect(screen.getByText('Password is required.')).toBeTruthy();
    expect(register).not.toHaveBeenCalled();
  });

  it('chains into verification when a dev verify_token is returned', async () => {
    register.mockResolvedValueOnce({ message: 'ok', verify_token: 'tok123' });
    render(<RegisterScreen />);
    fillValidForm();
    fireEvent.press(screen.getByText('Create account'));
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/verify-email?token=tok123'),
    );
  });

  it('shows a check-your-email screen when no token is returned', async () => {
    register.mockResolvedValueOnce({ message: 'ok' });
    render(<RegisterScreen />);
    fillValidForm();
    fireEvent.press(screen.getByText('Create account'));
    expect(await screen.findByText('Check your email')).toBeTruthy();
  });

  it('maps email_exists to an inline field error', async () => {
    register.mockRejectedValueOnce({
      response: { headers: { 'x-error-code': 'email_exists' } },
    });
    render(<RegisterScreen />);
    fillValidForm();
    fireEvent.press(screen.getByText('Create account'));
    expect(await screen.findByText('That email is already registered.')).toBeTruthy();
  });
});
