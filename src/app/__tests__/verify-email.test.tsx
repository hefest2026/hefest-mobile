/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
const mockReplace = jest.fn();
let mockParams: { token?: string } = {};

jest.mock('@/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

import { render, screen, waitFor } from '@testing-library/react-native';

import VerifyEmailScreen from '@/app/verify-email';
import { useAuth } from '@/auth/auth-context';

const useAuthMock = useAuth as jest.Mock;
const verify = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  useAuthMock.mockReturnValue({ verify });
});

describe('VerifyEmailScreen', () => {
  it('shows an error when no token is present', () => {
    mockParams = {};
    render(<VerifyEmailScreen />);
    expect(screen.getByText('Verification failed')).toBeTruthy();
    expect(verify).not.toHaveBeenCalled();
  });

  it('verifies the token from the deep link', async () => {
    mockParams = { token: 'deep-link-token' };
    verify.mockResolvedValueOnce(undefined);
    render(<VerifyEmailScreen />);
    await waitFor(() => expect(verify).toHaveBeenCalledWith('deep-link-token'));
    expect(screen.getByText('Verifying your email…')).toBeTruthy();
  });

  it('shows a mapped error when verification fails', async () => {
    mockParams = { token: 'bad-token' };
    verify.mockRejectedValueOnce({
      response: { headers: { 'x-error-code': 'invalid_verify_token' } },
    });
    render(<VerifyEmailScreen />);
    expect(
      await screen.findByText('This verification link is invalid or expired.'),
    ).toBeTruthy();
  });
});
