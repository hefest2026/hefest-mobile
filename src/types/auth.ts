/**
 * Shared auth domain types, mirrored from the hefest-api contract
 * (`openapi.json`, verified against `main`). See the HEF-41 design spec.
 */

/** Token envelope returned by verify-email / login / refresh. */
export type TokenResponse = {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  /** Populated only for mobile clients (`X-Client-Id: mobile_app`). */
  refresh_token: string | null;
};

export type RegisterRequest = {
  full_name: string;
  email: string;
  password: string;
};

/** `POST /register` body — includes `verify_token` only when `env == dev`. */
export type RegisterResponse = {
  message: string;
  verify_token?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type VerifyEmailRequest = {
  token: string;
};

/** `GET /users/me` */
export type UserMe = {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
};

/** A single SSO provider advertised by `GET /auth/providers`. */
export type AuthProvider = {
  id: string;
  name: string;
};

export type ProvidersResponse = {
  password: { available: boolean };
  providers: AuthProvider[];
};
