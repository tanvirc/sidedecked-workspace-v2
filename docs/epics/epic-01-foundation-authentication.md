# Epic 1: Foundation & Authentication

## Objective
Establish the SideDecked monorepo, shared tooling, and secure authentication flows to provide a stable base for all future development.

## Outcome
- Unified workspace with consistent linting, typechecking, and CI pipelines.
- OAuth2 authentication with session management and role-based guards.
- Guided onboarding for customers and vendors with compliance-ready data capture.

## Stories

### Story 1.1: Project Workspace & CI Bootstrap
As a platform engineer, I want a monorepo workspace with automated quality checks so that every service starts from a consistent foundation.

**Acceptance Criteria**
1. Initialize packages for `backend/`, `customer-backend/`, `storefront/`, and `vendorpanel/` with shared TypeScript, ESLint, and Prettier configs.
2. GitHub Actions pipeline runs lint, typecheck, unit tests, and coverage checks on each push and PR.
3. Bootstrap script provisions local environment variables, Postgres databases, Redis, and demo seed data.

### Story 1.2: OAuth2 Sign-In & Session Management
As a customer, I want to authenticate with my social account so that I can access SideDecked securely without creating a password.

**Acceptance Criteria**
1. Storefront and vendor panel expose Google and GitHub login via backend OAuth2 PKCE flow.
2. Backend issues short-lived access tokens, rotating refresh tokens, and stores them using httpOnly secure cookies.
3. Role-based guards protect APIs and UI routes for customer, vendor, and admin personas with automated access tests.

### Story 1.3: Onboarding & Profile Management
As a new vendor, I want guided onboarding so that I can complete my profile and meet compliance requirements.

**Acceptance Criteria**
1. Post-registration flow collects display name, location, avatar, preferred games, and desired role with validation.
2. Vendor onboarding captures business details (tax IDs, banking, documents) and routes submissions for admin approval.
3. Profile APIs and UI allow editing preferences, managing linked OAuth providers, and showing onboarding status.
