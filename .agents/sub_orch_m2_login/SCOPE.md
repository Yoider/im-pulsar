# Scope: Milestone 2 - Login Redesign

## Architecture
- **LoginForm (`src/components/landing/LoginForm/LoginForm.tsx`)**: React/Next.js component handling authentication input, submitting to Auth.js actions/handlers.
- **Page Container (`src/app/page.tsx` or wrapper)**: The layout page surrounding the login form.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Redesign LoginForm & Container | Apply minimalist slate theme, smooth borders, modern inputs, subtle shadows. Keep Auth.js flow functional. | None | IN_PROGRESS |

## Interface Contracts
- **LoginForm Props**: `LoginFormProps` (if any, e.g., redirectUrl or styling properties).
- **Authentication**: Integrates with Auth.js (NextAuth) API. Must preserve the state, input handling, and submission logic to authenticate successfully.
