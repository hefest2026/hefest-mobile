import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/auth/validation';

describe('validateEmail', () => {
  it('rejects empty / whitespace', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('rejects malformed addresses', () => {
    expect(validateEmail('not-an-email')).toBe('Enter a valid email address.');
    expect(validateEmail('a@b')).toBe('Enter a valid email address.');
  });

  it('accepts a valid address (trimmed)', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('rejects empty', () => {
    expect(validatePassword('')).toBe('Password is required.');
  });

  it('enforces the minimum length', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toContain(
      `${MIN_PASSWORD_LENGTH}`,
    );
  });

  it('accepts a long-enough password', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull();
  });
});

describe('validateFullName', () => {
  it('rejects blank names', () => {
    expect(validateFullName('  ')).toBe('Name is required.');
  });

  it('accepts a real name', () => {
    expect(validateFullName('Ada Lovelace')).toBeNull();
  });
});
