# Story 1.1: Project Workspace & CI Bootstrap

## Goal
Bootstrap the monorepo workspace with shared tooling and CI pipelines.

## Context
Epic 1: Foundation & Authentication

## Dependencies
- None

## Acceptance Criteria
1. Initialize packages for backend, customer-backend, storefront, and vendorpanel with shared TypeScript, ESLint, and Prettier configurations.
2. Configure GitHub Actions to run lint, typecheck, unit tests, and coverage gates on each push and pull request.
3. Provide a bootstrap script that provisions environment variables, local PostgreSQL databases, Redis, and seeded demo data.

## Implementation Tasks
- Configure Turborepo workspaces and shared config packages for linting, formatting, and TypeScript settings.
- Add GitHub Actions workflow covering lint, typecheck, unit tests, and coverage thresholds for all packages.
- Implement developer bootstrap script to create .env files, provision local databases, run migrations, and seed demo data.

## Validation Plan
- Run `turbo run lint test` to confirm pipelines succeed across packages.
- Execute the bootstrap script on a clean machine to verify database and Redis provisioning succeeds.

