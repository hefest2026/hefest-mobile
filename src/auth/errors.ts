/**
 * Maps backend `X-Error-Code` header values to friendly, user-facing copy.
 * Nothing is ever silently swallowed: unknown / network failures fall back to a
 * generic message.
 */

export type AuthErrorCode =
  | 'email_exists'
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'invalid_verify_token'
  | 'token_reuse_detected';

const MESSAGES: Record<AuthErrorCode, string> = {
  email_exists: 'That email is already registered.',
  invalid_credentials: 'Email or password is incorrect.',
  // Resend flow tracked in HEF-46.
  email_not_verified: 'Please verify your email — check your inbox.',
  invalid_verify_token: 'This verification link is invalid or expired.',
  token_reuse_detected: "You've been signed out, please log in again.",
};

const GENERIC_MESSAGE =
  'Something went wrong. Please check your connection and try again.';

/** True when the code signals the held session is no longer trustworthy. */
export function isHardLogoutCode(code: string | null | undefined): boolean {
  return code === 'token_reuse_detected';
}

/** Resolve a friendly message for a backend error code (or the generic fallback). */
export function messageForErrorCode(code: string | null | undefined): string {
  if (code && code in MESSAGES) {
    return MESSAGES[code as AuthErrorCode];
  }
  return GENERIC_MESSAGE;
}

/**
 * Pull the `X-Error-Code` header out of a thrown request error (structurally,
 * to avoid an axios import here) and map it to friendly copy.
 */
export function messageFromError(error: unknown): string {
  const headers = (
    error as { response?: { headers?: Record<string, string> } } | null
  )?.response?.headers;
  const code = headers?.[ERROR_CODE_HEADER_LOWER];
  return messageForErrorCode(code);
}

/** Axios lower-cases response header keys. */
const ERROR_CODE_HEADER_LOWER = 'x-error-code';

/** Extract the raw error code from a thrown request error, if any. */
export function errorCodeFromError(error: unknown): string | null {
  const headers = (
    error as { response?: { headers?: Record<string, string> } } | null
  )?.response?.headers;
  return headers?.[ERROR_CODE_HEADER_LOWER] ?? null;
}
