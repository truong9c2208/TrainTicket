# Shared Frontend Layer

This folder contains cross-platform frontend logic intended to be reused by mobile, web, and desktop clients.

## Modules

- `src/types/api.ts`: Shared API contract types
- `src/api/http-client.ts`: Platform-agnostic HTTP client (uses `fetch`)
- `src/auth/session.ts`: Shared auth session utilities and token key constants
- `src/validation/auth.ts`: Shared auth form validation helpers

## Usage Example

```ts
import { createHttpClient, ACCESS_TOKEN_KEY } from '@repo/shared/src';

const api = createHttpClient({
  baseUrl: 'https://your-api.example.com/api',
  getAccessToken: async () => localStorage.getItem(ACCESS_TOKEN_KEY),
});
```

For React Native, use `AsyncStorage` in `getAccessToken`.
For web/desktop, use `localStorage`, secure storage, or OS keychain adapters.
