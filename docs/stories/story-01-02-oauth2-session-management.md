# Story 1.2: OAuth2 Sign-In & Session Management

## Goal
Deliver secure social authentication with robust session lifecycle management.

## Context
Epic 1: Foundation & Authentication

## Dependencies
- story-01-01-project-workspace-ci-bootstrap.md

## Acceptance Criteria
1. Expose Google and GitHub OAuth2 login flows via backend PKCE implementation shared by storefront and vendor panel.
2. Issue short-lived access tokens and rotating refresh tokens, persisting them in secure httpOnly cookies with sameSite settings.
3. Protect APIs and UI routes for customer, vendor, and admin personas via role-aware guards backed by automated tests.

## Implementation Tasks
- Implement OAuth2 PKCE handlers in backend auth service and connect storefront/vendor panel callbacks.
- Configure token issuance, rotation, and secure cookie storage with refresh token revocation support.
- Apply role-based guards to API routes and UI middleware with comprehensive access tests.

## Validation Plan
- Simulate login through both providers and verify session cookies, token rotation, and logout flows.
- Run auth integration test suite covering role access and token expiration handling.

