---
id: S04
milestone: M002
status: draft
---

# S04: Vendor Panel Integration

## Goal

Admin can manage sellers, products, orders, and payouts in the vendor panel. Stripe Connect extension shows seller account status.

## Why This Slice

The vendor panel is the operational backbone for admins. Without it, all management requires direct API calls or database queries.

## Scope

### In Scope
- Vendor panel extensions: sellers list, seller detail, seller approval workflow
- Stripe Connect extension: seller account status, payout history
- Orders management with fulfillment status

### Out of Scope
- Content moderation / flagged listing queue (M005)
- Dispute resolution admin UI (M005)
- Advanced analytics (future)

## Integration Points

### Consumes
- All commerce data from M002/S01+S02+S03

### Produces
- `/sellers` and `/stripe-connect` vendor panel extension routes
- Admin seller approval workflow
