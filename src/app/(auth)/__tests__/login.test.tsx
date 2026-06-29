/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('@/components/sso-buttons', () => ({ SsoButtons: () => null }));
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/(auth)/login';
import { useAuth } from '@/auth/auth-context';

const useAuthMock = useAuth as jest.Mock;
const login = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({ login });
});

describe('LoginScreen', () => {
  it('blocks submit and shows validation errors for empty fields', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign in'));
    expect(screen.getByText('Email is required.')).toBeTruthy();
    expect(screen.getByText('Password is required.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits trimmed credentials when valid', async () => {
    login.mockResolvedValueOnce(undefined);
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), '  user@example.com  ');
    fireEvent.changeText(screen.getByLabelText('Password'), 'longpassword1');
    fireEvent.press(screen.getByText('Sign in'));
    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'longpassword1',
      }),
    );
  });

  it('surfaces a mapped error banner on failed login', async () => {
    login.mockRejectedValueOnce({
      response: { headers: { 'x-error-code': 'invalid_credentials' } },
    });
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'longpassword1');
    fireEvent.press(screen.getByText('Sign in'));
    expect(await screen.findByText('Email or password is incorrect.')).toBeTruthy();
  });
});
