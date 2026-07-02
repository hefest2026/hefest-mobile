/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
}));

import { render } from '@testing-library/react-native';

import NotFound from '@/app/+not-found';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('+not-found route', () => {
  it('bounces any unmatched path back to the root redirect', () => {
    render(<NotFound />);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
