# Story 1.3.3: Role Management

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a user, I want to change my account role so that I can start selling cards or focus only on buying/collecting._

## Acceptance Criteria

- (IMPLEMENTED) Users can upgrade from Customer to Individual Seller through verification process
- (IMPLEMENTED) Individual Seller verification requires identity documents and business information
- (IN PROGRESS) Role changes are processed within 1-8 hours (PARTIAL)
- (IMPLEMENTED) Users can have both Customer and Individual Seller roles simultaneously
- (IMPLEMENTED) Clear explanation of each role's capabilities and restrictions
- (IN PROGRESS) Role-specific dashboard and navigation changes (PARTIAL)
- (IMPLEMENTED) Individual Sellers must agree to additional terms and conditions
- (IN PROGRESS) Role changes trigger appropriate notification emails (PARTIAL)

## Implementation Notes

The seller upgrade page is located at `storefront/src/app/[locale]/(main)/sell/upgrade/page.tsx`. The CustomerToSellerUpgrade component is in `storefront/src/components/seller/CustomerToSellerUpgrade`. The ConsumerSellerOnboarding component handles the upgrade flow. Role-specific navigation is partially implemented in `storefront/src/components/molecules/UserNavigation/UserNavigation.tsx`. The role comparison table shows Customer vs Individual Seller features and capabilities.
