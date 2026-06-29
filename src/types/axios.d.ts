// Augments axios config with the custom flags the auth interceptors rely on.
import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Skip Bearer attachment + refresh handling (auth endpoints themselves). */
    skipAuth?: boolean;
  }
  interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    /** Internal: marks a request already retried once after a 401. */
    _retried?: boolean;
  }
}
