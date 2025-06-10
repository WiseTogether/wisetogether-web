# Implementation Notes

This document outlines the reasoning and technical approach behind selected changes during the project.

---

## Feature: Delete Transaction Functionality
**Issue:** [#11](https://github.com/WiseTogether/wisetogether-web/issues/11)

### Problem
- No way to delete transactions from the UI
- Missing API endpoint for transaction deletion

### Implementation
1. Added `deleteTransaction` endpoint in `src/api/transactionsApi.ts`:
   - Implemented DELETE request to `/expenses/:id`
   - Added proper error handling and type safety

2. Enhanced Transaction Components:
   - Added `onDelete` prop to `TransactionRowProps` and `TransactionListProps`
   - Updated `TransactionRow` to handle delete with confirmation dialog
   - Added `handleDeleteTransaction` to `Transactions` component for state management
   - Implemented optimistic UI updates for better user experience

### Notes
- Delete operation requires user confirmation
- UI updates immediately after successful deletion

---

## Feature: Transaction Editing Functionality
**Issue:** [#5](https://github.com/WiseTogether/wisetogether-web/issues/5)

### Problem
- No API functionality to edit existing transactions
- Edit button opened NewTransactionModal, creating new transactions instead of updating existing ones

### Implementation
1. Added `editTransaction` endpoint in `src/api/transactionsApi.ts`

2. Refactored `Transaction.tsx` into smaller, focused components for better readability and reusability:
   - `TransactionForm` – Handles user input for creating and editing a transaction
   - `TransactionList` – Renders a list of transactions
   - `TransactionRow` – Displays a single transaction with optional user avatar, expense type, and split details based on view configuration
   - `TransactionModal` – Handles both create and edit operations

3. Added `src/types/transaction.ts` for type definitions:
   - Defines Transaction, form validation errors, and props for transaction-related components (form, list, row, modal)

### Notes
- Single form component now handles both create and edit operations
- State updates are optimized to minimize API calls
- Improved error handling and loading states
- Type safety ensured throughout the transaction flow

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

## Fix: Transaction Labels and Partner Fallback
**Issues:** [#7](https://github.com/WiseTogether/wisetogether-web/issues/7), [#8](https://github.com/WiseTogether/wisetogether-web/issues/8)

### Problems
- New transactions are assigned incorrect labels
- Shared transactions displayed "undefined owes you" when partner name was missing

### Implementation
1. Fixed transaction form initialization:
   - Removed hardcoded `setExpenseType('personal')` in `TransactionForm`
   - Updated `handleAddTransaction` in `Transactions` to set expense type based on active tab
   - Form now opens with correct tab (shared/personal) based on context

2. Added partner name fallback:
   - Updated string concatenation in `TransactionRow` to use nullish coalescing
   - Changed `${partnerProfile?.name} owes you` to `${partnerProfile?.name ?? 'your partner'} owes you`
   - Ensures consistent display even when partner data is missing

### Notes
- Improved user experience by maintaining context between views
- Enhanced error resilience with proper fallbacks

---

## Feature: Form Validation with Zod

**Issue:** [#6](https://github.com/WiseTogether/wisetogether-web/issues/6)

### Problem
- Form validation was implemented manually in each component
- Validation rules were scattered and inconsistent
- No type safety for form data
- Duplicate validation logic across components

### Implementation
1. Added dependencies:
   - `zod` for schema validation
   - `@hookform/resolvers` for Zod integration with React Hook Form
   - `react-hook-form` for form state management

2. Created centralized validation schemas:
   - Transaction form schema in `src/types/transaction.ts`
   - Auth form schemas in `src/types/auth.ts`:

3. Updated form components:
   - `TransactionForm`: Implemented Zod validation for transaction data
   - `Login`: Implemented Zod validation with proper error messages
   - `Register`: Implemented Zod validation with password confirmation check

### Notes
- Form validation is now centralized and consistent
- Type safety is enforced through Zod schemas
- Error messages are more user-friendly
- Split details calculations are more robust
- Form state management is more efficient
- Auth forms now have proper validation and error handling

---

## Feature: Google OAuth login flow

**Issue:** [#9](https://github.com/WiseTogether/wisetogether-web/issues/9)

### Problem
- Google OAuth button exists in the UI but doesn't perform any logic or redirect to Supabase OAuth.

### Implementation
1. AuthContext.tsx
   - Added `signInWithGoogle` method with support for custom `redirectTo` URLs
   - Introduced `extractUserProfile` helper to derive user metadata from Supabase session
   - Updated `signUp` to save name in Supabase's `user_metadata`
   - Session now uses metadata directly, eliminating separate profile creation

2. Login & Register Components
   - Added Google sign-in buttons that initiate OAuth flow
   - Implemented `handleGoogleSignIn` in `Register` with invitation code handling
   - Used `signInWithGoogle` with custom redirect including the invite code when available

3. AuthCallback.tsx
   - Created to handle Supabase OAuth redirect
   Extracts invitation code from URL and joins user to shared account if applicable
   Provides fallback behavior and error resilience (e.g., continues to home even on failure)

4. Routing
   - Added `/auth/callback` route to handle OAuth redirection

5. Shared Account Flow
   - Improved flow by deferring shared account joining until session is available
   - Removed premature API calls that relied on missing access token
   - Handles joining with both email/password and Google OAuth flows

### Notes
- Custom profile creation is replaced with Supabase's `user_metadata` for simplicity

---

## Feature: Global error handling for render failures and API errors

**Issue:** [#12](https://github.com/WiseTogether/wisetogether-web/issues/12)

### Problem
- Unhandled rendering or network errors can crash the UI or fail silently. 
- There's no centralized error handling for the app or for API failures.

### Implementation
1. Global Error Boundary
   - Created `ErrorBoundary.tsx` to catch JavaScript errors in the component tree.
   - Provides a "Refresh Page" button and supports custom fallback components via props.
   - Wrapped the entire app in `ErrorBoundary` from `main.tsx` to catch render errors outside the router and auth context.

2. Reusable Fallback UI
   - Added `ErrorFallback.tsx` with customizable title, message, icon, and action button.
   - Used as the default fallback in `ErrorBoundary`.

3. Route-Level Error Handling
   - Introduced `RouteErrorBoundary.tsx` for route-specific error boundaries.
   - Uses `ErrorFallback` and includes navigation (go back, retry).

4. Centralized Error Utility
   - Created `errorHandler.ts` to standardize error and toast handling across the app.

5. Login and Register Updates
   - Replaced local error state with toast-based feedback.
   - Added success messages and improved error detail.

### Notes
- Unexpected errors are caught and displayed using a global UI fallback.
- API errors are handled consistently and logged or surfaced to the user via a toast.

---

## Fix: Loading States and Premature UI Prevention

**Issue:** [#13](https://github.com/WiseTogether/wisetogether-web/issues/13)

### Problem
- UI components were rendering before data fetching completed
- Inconsistent loading states across the application
- No visual feedback during data processing
- Potential for showing incomplete or incorrect data

### Implementation
1. Consistent Loading States
   - Integrated `react-spinners` with `FadeLoader` for uniform feedback
   - Applied at auth (AuthContext), app (App.tsx), and component levels

2. Protected Route Enhancement
   - `ProtectedRoute` now shows a loader during auth checks
   - Prevents premature rendering and improves user feedback

3. Improved Data Fetching
   - Introduced `isDataLoading` in `App.tsx` for initial loads
   - Added loaders for transactions and dashboard expense calculations
   - Enhanced error handling and state management

4. Component-Level Feedback
   - Loaders for filtering, calculations, and modal API interactions

### Notes
- Loading states are now consistent across the application
- UI components only render when data is ready

---

## Feature: Toast Notifications for Actions

**Issue:** [#14](https://github.com/WiseTogether/wisetogether-web/issues/14)

### Problem
- No immediate feedback when performing key actions (e.g., submitting a transaction)
- Error messages shown via alerts or console logs

### Implementation
1. Toast Notifications
   - Renamed `errorHandler.ts` to `toastNotifications.ts` for clarity and consistency
   - Integrated toast notifications for all key user actions (e.g., create, update, delete)
   - Added both success and error toast messages throughout the app

2. Component Updates
   - Updated `Transactions` and `TransactionForm` components with toast notifications
   - Updated `Login` and `Register` components to use the new toastNotifications utility
   - Updated `InvitationCard` component to use toast notifications instead of alerts

### Notes
- Users now receive immediate feedback for all key actions
- The `baseApiClient` continues to handle API error parsing and formatting behind the scenes

---

## Refactor: Data Fetching and State Management

**Issue:** [#15](https://github.com/WiseTogether/wisetogether-web/issues/15), [#18](https://github.com/WiseTogether/wisetogether-web/issues/18) 

### Problem
- Global data was fetched in `App.tsx` and passed down via props
- Inefficient calculations on every render

### Implementation
1. Custom Hooks Refactoring
   - Created `useSharedAccountData` hook: manages shared account, partner profile, invitations, loading, and refresh
   - Created `useTransactionsData` hook: centralized transaction filtering and breakdown calculations using useMemo

2. Component Updates
   - `Dashboard.tsx`: removed filtering logic, optimized breakdowns, simplified state and loading.
   - `Transactions.tsx`: uses filtered data from hook, removed local filtering.

3. Performance Optimizations
   - Added `useMemo` for expensive calculations
   - Reduced state updates and re-renders
   - Centralized data fetching and filtering

### Notes
- Better separation of concerns between data fetching and UI
- Improved performance and maintainability

---
