# Story 1.4.2: Individual Seller Approval Process

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As an administrator, I want to review and approve Individual Seller applications so that I can ensure platform quality and compliance._

## Acceptance Criteria

- (NOT BUILT) Admin dashboard showing pending Individual Seller applications
- (NOT BUILT) Document verification workflow with approval/rejection options
- (NOT BUILT) Automated checks for banned individuals or fraudulent information
- (NOT BUILT) Manual review process for edge cases or high-risk applications
- (IN PROGRESS) Approval notifications sent to applicants with next steps (PARTIAL)
- (IN PROGRESS) Rejection notifications with specific reasons and reapplication guidance (PARTIAL)
- (IN PROGRESS) Individual Seller account activation upon approval with initial setup guidance (PARTIAL)
- (NOT BUILT) Background check integration for high-volume or suspicious applications

## Implementation Notes

The admin approval portal is not yet built (TBD). The application queue interface would use a data table with columns for Applicant Name, Application Date, Status, Risk Score, and Actions. Status badges would use color coding: Pending (yellow), Under Review (blue), Approved (green), Rejected (red). A document viewer with zoom controls and annotation tools would support the review process. The automated checks panel would display identity verification API results and sanctions/watchlist screening.
