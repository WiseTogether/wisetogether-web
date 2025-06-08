# Implementation Notes

This document outlines the reasoning and technical approach behind selected changes during the project.

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

