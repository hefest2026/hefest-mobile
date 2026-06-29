/**
 * Inline client-side validation for the auth forms. Mirrors the backend rules
 * (password min 12 chars) so the user gets immediate feedback before submit.
 */

/** Backend-enforced minimum password length. */
export const MIN_PASSWORD_LENGTH = 12;

// Deliberately permissive: catches obvious typos without rejecting valid addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message, or `null` when the email is acceptable. */
export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return null;
}

/** Returns an error message, or `null` when the password is acceptable. */
export function validatePassword(value: string): string | null {
  if (value === '') {
    return 'Password is required.';
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

/** Returns an error message, or `null` when the name is acceptable. */
export function validateFullName(value: string): string | null {
  return value.trim() === '' ? 'Name is required.' : null;
}
