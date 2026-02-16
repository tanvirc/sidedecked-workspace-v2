# Story 2.3.1: Return Request Process

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in_progress
**Domain**: Commerce (backend/)

## User Story

_As a customer, I want to request returns for items that don't meet my expectations so that I can get a refund or exchange._

## Acceptance Criteria

- (IMPLEMENTED) Return request form accessible from order history
- (IMPLEMENTED) Return reason selection (not as described, damaged, wrong item, changed mind)
- (IN PROGRESS) Photo upload for condition documentation (PARTIAL)
- (NOT BUILT) Return policy display specific to each vendor
- (IN PROGRESS) Automatic return authorization (RMA) number generation (PARTIAL)
- (IN PROGRESS) Return shipping label generation (when vendor covers return shipping) (PARTIAL)
- (IN PROGRESS) Return tracking and status updates (PARTIAL)
- (NOT BUILT) Integration with vendor return preferences and policies
- (IMPLEMENTED) Automated partial returns for multi-item orders

## Implementation Notes

The return form is accessible from `/user/orders/[id]/return`. The OrderReturnSection component includes ReturnItemsTab for item selection and ReturnMethodsTab for shipping method. The `createReturnRequest` function in orders.ts handles RMA generation. The `retriveReturnMethods` function retrieves available return shipping options. Item selection logic in `handleSelectItem` enables partial returns for multi-item orders.
