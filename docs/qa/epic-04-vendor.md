# QA Gate – Epic 04 Vendor Management

- **Gate Status**: Pending
- **QA Owner**: Quinn (Test Architect)

## Entry Criteria
- Story 04.1 onboarding wizard available behind feature flag.
- Compliance document storage configured in staging bucket.

## Exit Criteria
- E2E onboarding scenario from vendor registration to admin approval and activation.
- Security review covering document storage, Stripe Connect onboarding, and audit logs.
- Automation smoke tests ensuring notifications dispatch as expected.

## Coverage Strategy
- Unit: form validation, backend onboarding workflows.
- Integration: admin approval lifecycle, Stripe Connect callbacks.
- Manual QA: document uploads of varying sizes/types, edge cases for incomplete submissions.

## Outstanding Risks
- Handling of large file uploads requires performance assessment.
- Admin notification channel not finalized; track as dependency.

## Artifacts & Evidence
- Approval workflow diagrams stored in `docs/epics/epic-04-vendor-management.md` (append updates).
- Test case matrix to be added under `docs/qa/matrices/vendor-onboarding.xlsx`.
