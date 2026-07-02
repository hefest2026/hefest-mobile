import {
  errorCodeFromError,
  isHardLogoutCode,
  messageForErrorCode,
  messageFromError,
} from '@/auth/errors';

describe('messageForErrorCode', () => {
  it('maps known codes to friendly copy', () => {
    expect(messageForErrorCode('email_exists')).toMatch(/already registered/i);
    expect(messageForErrorCode('invalid_credentials')).toMatch(/incorrect/i);
    expect(messageForErrorCode('email_not_verified')).toMatch(/verify your email/i);
    expect(messageForErrorCode('invalid_verify_token')).toMatch(/invalid or expired/i);
    expect(messageForErrorCode('token_reuse_detected')).toMatch(/signed out/i);
  });

  it('falls back generically for unknown / nullish codes', () => {
    expect(messageForErrorCode('weird')).toMatch(/went wrong/i);
    expect(messageForErrorCode(null)).toMatch(/went wrong/i);
    expect(messageForErrorCode(undefined)).toMatch(/went wrong/i);
  });
});

describe('isHardLogoutCode', () => {
  it('is true only for reuse detection', () => {
    expect(isHardLogoutCode('token_reuse_detected')).toBe(true);
    expect(isHardLogoutCode('invalid_credentials')).toBe(false);
    expect(isHardLogoutCode(null)).toBe(false);
  });
});

describe('error extraction from thrown request errors', () => {
  const err = { response: { headers: { 'x-error-code': 'email_exists' } } };

  it('reads the raw code', () => {
    expect(errorCodeFromError(err)).toBe('email_exists');
    expect(errorCodeFromError({})).toBeNull();
    expect(errorCodeFromError(null)).toBeNull();
  });

  it('maps a thrown error straight to copy', () => {
    expect(messageFromError(err)).toMatch(/already registered/i);
    expect(messageFromError(new Error('network'))).toMatch(/went wrong/i);
  });
});
