/** Jest config for hefest-mobile. Coverage target lowered to 60% (HEF-41). */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/style-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/api/**/*.ts',
    'src/auth/**/*.{ts,tsx}',
    'src/components/button.tsx',
    'src/components/text-field.tsx',
    'src/components/form-banner.tsx',
    'src/components/sso-buttons.tsx',
    'src/app/(auth)/**/*.tsx',
    'src/app/verify-email.tsx',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
