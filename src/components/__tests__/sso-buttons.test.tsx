/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/auth/auth-api', () => ({ fetchProviders: jest.fn() }));
jest.mock('@/auth/auth-context', () => ({ useAuth: jest.fn() }));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { fetchProviders } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
import { SsoButtons } from '@/components/sso-buttons';

const fetchProvidersMock = fetchProviders as jest.Mock;
const useAuthMock = useAuth as jest.Mock;
const loginWithSso = jest.fn();

function renderWithQuery(node: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({ loginWithSso });
});

describe('SsoButtons', () => {
  it('renders a button per advertised provider', async () => {
    fetchProvidersMock.mockResolvedValueOnce({
      password: { available: true },
      providers: [
        { id: 'google', name: 'Google' },
        { id: 'microsoft', name: 'Microsoft' },
      ],
    });
    renderWithQuery(<SsoButtons />);
    expect(await screen.findByText('Continue with Google')).toBeTruthy();
    expect(screen.getByText('Continue with Microsoft')).toBeTruthy();
  });

  it('renders nothing when no providers are enabled', async () => {
    fetchProvidersMock.mockResolvedValueOnce({
      password: { available: true },
      providers: [],
    });
    renderWithQuery(<SsoButtons />);
    await waitFor(() => expect(fetchProvidersMock).toHaveBeenCalled());
    expect(screen.queryByText(/Continue with/)).toBeNull();
  });

  it('launches the SSO flow for the chosen provider', async () => {
    fetchProvidersMock.mockResolvedValueOnce({
      password: { available: true },
      providers: [{ id: 'google', name: 'Google' }],
    });
    loginWithSso.mockResolvedValueOnce(true);
    renderWithQuery(<SsoButtons />);
    fireEvent.press(await screen.findByText('Continue with Google'));
    await waitFor(() => expect(loginWithSso).toHaveBeenCalledWith('google'));
  });
});
