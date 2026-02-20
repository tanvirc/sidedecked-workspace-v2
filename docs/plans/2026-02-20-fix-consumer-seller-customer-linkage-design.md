# Fix Consumer-Seller Customer Linkage

**Date:** 2026-02-20
**Status:** Approved
**Scope:** backend (mercur-db)

## Problem

Every consumer-seller API route queries `Seller.member_customer_id` — a field that does not exist on the Seller or Member models. MikroORM throws `Trying to query by not existing property Seller.member_customer_id`, causing 500 errors on all consumer-seller endpoints in production.

Additionally, the upgrade route (`POST /store/consumer-seller/upgrade`) creates a `Seller` record but never creates a `Member` record, so even if the query worked, there would be no way to link a customer back to their seller.

## Root Cause

The consumer-seller feature was built assuming `member_customer_id` existed on the Seller model. All 7 call sites cast to `as any` to suppress TypeScript errors, masking the fact that the field was never added.

## Solution: Add `customer_id` to `Member` model

### Model Change

Add `customer_id` (nullable text) to the `Member` model. Nullable because existing vendor-panel members authenticate directly as `seller` actor type and have no associated customer.

```typescript
// member.ts
export const Member = model.define("member", {
  // ... existing fields
  customer_id: model.text().nullable(),
  seller: model.belongsTo(() => Seller, { mappedBy: "members" }),
});
```

### Upgrade Route

Replace direct `sellerService.createSellers()` call with:
1. Create `Seller` record via `sellerService.createSellers()`
2. Create `Member` record via `sellerService.createMembers()` with `customer_id` and `seller_id`
3. Both in a try/catch with cleanup on failure

### Lookup Pattern

Replace all `member_customer_id` queries with:

```typescript
const { data: [seller] } = await query.graph({
  entity: 'seller',
  filters: { members: { customer_id: customerId } },
  fields: ['id', 'name']
})
```

Extract into shared `fetchConsumerSellerByCustomerId` utility (already exists in `payout-account/utils.ts`, needs rewrite).

### Migration

One migration: add `customer_id` text column (nullable) to `member` table.

## Files Changed

| File | Change |
|---|---|
| `packages/modules/seller/src/models/member.ts` | Add `customer_id` field |
| `api/store/consumer-seller/upgrade/route.ts` | Create Seller + Member |
| `api/store/consumer-seller/payout-account/utils.ts` | Rewrite lookup to use query.graph |
| `api/store/consumer-seller/dashboard/route.ts` | Use shared utility |
| `api/store/consumer-seller/listings/route.ts` | Use shared utility (GET + POST) |
| `api/store/consumer-seller/listings/[id]/route.ts` | Use shared utility (PUT + DELETE) |
| `api/store/consumer-seller/orders/route.ts` | Use shared utility |
| `tests/api/consumer-seller/payout-utils.unit.spec.ts` | Update assertions |
| New migration file | Add `customer_id` to `member` table |

## Why This Approach

- Follows existing MercurJS architecture (Seller -> Member relationship)
- Mirrors how `fetchSellerByAuthActorId` works for vendor panel (filters through `members`)
- Minimal schema change (one nullable column)
- No new link tables or cross-module abstractions needed
