/**
 * Shared auth domain types, mirrored from the hefest-api contract
 * (`openapi.json`). See the HEF-41 design spec.
 */
/** Request schema for changing the current user's password.

Attributes:
    current_password: The user's existing password, for re-authentication.
    new_password: The replacement password (minimum 12 characters). */
export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

/** Request schema for user login.

Attributes:
    email: User's email address
    password: User's password */
export type LoginRequest = {
  email: string;
  password: string;
};

/** OAuth provider availability information.

Attributes:
    name: Provider name (e.g., "google", "microsoft")
    available: Whether provider is configured and available
    login_url: URL to initiate OAuth login (None if unavailable) */
export type OAuthProviderInfo = {
  name: string;
  available: boolean;
  login_url: string | null;
};

/** Response schema for available authentication providers.

Attributes:
    password: Password authentication availability
    providers: List of available OAuth providers */
export type ProvidersResponse = {
  password: Record<string, boolean>;
  providers: OAuthProviderInfo[];
};

/** Request schema for user registration.

Attributes:
    email: Valid email address for the user account
    password: Password (minimum 12 characters)
    full_name: User's full name */
export type RegisterRequest = {
  email: string;
  password: string;
  full_name: string;
};

/** Response schema for successful authentication.

Attributes:
    access_token: JWT access token
    token_type: Token type (default: "bearer")
    expires_in: Token expiration time in seconds
    refresh_token: Opaque refresh token, returned only to mobile clients
        (``X-Client-Id: mobile_app``) for storage in the device keystore.
        ``None`` for web clients, which receive it via the httpOnly cookie. */
export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string | null;
};

/** Response schema for the current authenticated user.

Attributes:
    id: User UUID
    email: User email address
    full_name: User display name
    role: User role (student or organizer) */
export type UserMeResponse = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
};

export type UserRole = 'student' | 'organizer';

/** Request schema for updating the current user's profile.

Attributes:
    full_name: New display name (trimmed, non-empty, max 200 chars). */
export type UserUpdateRequest = {
  full_name: string;
};

/** Request schema for email verification.

Attributes:
    token: JWT token from email verification link */
export type VerifyEmailRequest = {
  token: string;
};

/** Message map returned by POST /register. */
export type RegisterResponse = Record<string, string>;

/** Alias for the current user response. */
export type UserMe = UserMeResponse;
