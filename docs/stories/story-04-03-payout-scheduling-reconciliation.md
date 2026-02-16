# Story 4.3: Payout Scheduling & Reconciliation

## Goal
Automate vendor payouts with transparent ledgers and exportable records.

## Context
Epic 4: Payments & Compliance

## Dependencies
- story-04-02-payment-capture-escrow.md

## Acceptance Criteria
1. Schedule vendor transfers based on cadence, thresholds, and reserve policies.
2. Record every charge, fee, commission, and payout within mercur-db with immutable audit trail.
3. Expose payout histories, downloadable statements, and export reports to vendors.

## Implementation Tasks
- Implement payout scheduler honoring configurable cadence and reserve thresholds.
- Extend finance ledger schema and services to log all monetary movements with audit metadata.
- Build vendor panel views and exports for payout history and statements.

## Validation Plan
- Execute automated tests verifying ledger balances with simulated charges and payouts.
- Download sample statements and ensure data matches ledger records.

