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

