/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
const mockRedirect = jest.fn();

jest.mock('@/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
}));

import { render } from '@testing-library/react-native';

import Index from '@/app/index';
import { useAuth } from '@/auth/auth-context';

const useAuthMock = useAuth as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('root Index route', () => {
  it('renders nothing while the session is bootstrapping', () => {
    useAuthMock.mockReturnValue({ status: 'bootstrapping' });
    render(<Index />);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects a signed-in user into the events feed', () => {
    useAuthMock.mockReturnValue({ status: 'signedIn' });
    render(<Index />);
    expect(mockRedirect).toHaveBeenCalledWith('/events');
  });

  it('redirects a signed-out user to the login screen', () => {
    useAuthMock.mockReturnValue({ status: 'signedOut' });
    render(<Index />);
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });
});
