# Implementation Notes

This document outlines the reasoning and technical approach behind selected changes during the project.

---

## Refactor: Send Supabase Access Token in Authenticated Requests
**Issue:** [#10](https://github.com/WiseTogether/wisetogether-web/issues/10)

### Problem
- API calls don't include Supabase access tokens in the `Authorization` header and there was no centralized or standardized approach to managing authentication.

### Implementation
1. Created a centralized API client (`src/lib/apiClient.ts`):
   - Implemented a custom `ApiError` class for consistent error handling
   - Created an API request function in `AuthContext` to access Supabase session
   - Removed manual token passing in favor of automatic token injection from session
   - Added standardized error handling for authentication failures

2. Refactored API modules to use the new client:
   - `transactionsApi.ts`
   - `sharedAccountApi.ts`
   - `userApi.ts`

### Notes
- All API calls now automatically include the Supabase access token
- Authentication errors are handled consistently

---

