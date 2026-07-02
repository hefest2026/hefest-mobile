/* eslint-env jest */

// In-memory secure store so token persistence is testable without native code.
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    __store: store,
    getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
  };
});

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `hefestmobile://${path}`),
  parse: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// The jestSetup.js shipped in @shopify/flash-list@2.0.2 swaps FlashList for a
// `RecyclerView` export that no longer exists in this version's public API
// (FlashList already *is* RecyclerView internally) — so only the layout
// measurement mocks are applied here, not the broken swap.
jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
  const actual = jest.requireActual(
    '@shopify/flash-list/dist/recyclerview/utils/measureLayout',
  );
  return {
    ...actual,
    measureParentSize: jest.fn(() => ({ x: 0, y: 0, width: 400, height: 900 })),
    measureFirstChildLayout: jest.fn(() => ({ x: 0, y: 0, width: 400, height: 900 })),
    measureItemLayout: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 100 })),
  };
});
