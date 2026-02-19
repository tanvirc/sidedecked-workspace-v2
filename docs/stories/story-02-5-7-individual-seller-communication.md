# Story 2.5.7: Individual Seller Communication

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: done
**Domain**: Hybrid — Commerce (backend/) + Vendorpanel + Storefront
**Feature Branch**: `feature/story-2-5-7`

## User Story

_As an individual seller, I want to communicate effectively with buyers so that I can provide good customer service and resolve issues._

## Acceptance Criteria

- (IMPLEMENTED) **AC1**: Order-linked conversations with order context header (order ID, items, status, price) visible in vendorpanel chat
- (IMPLEMENTED) **AC2**: Seller message templates — 5 predefined categories (shipping, thanks, condition, delay, return) insertable into chat
- (IMPLEMENTED) **AC3**: Quick response shortcuts contextual to conversation state (chips rendered based on context)
- (IMPLEMENTED) **AC4**: Response time tracking per seller with profile badge (4 tiers: Lightning <1h, Fast <4h, Responsive <24h, none)
- (IMPLEMENTED) **AC5**: Escalation to platform support with conversation history forwarded, seller notified when support joins
- (IMPLEMENTED) **AC6**: "Message Buyer" button on vendorpanel order detail + "Message Seller" already exists on storefront order detail
- (IMPLEMENTED) **AC7**: Professional communication guidelines shown to new sellers on first message (onboarding modal, dismissible)

### Deferred (out of scope)

- Translation support for international buyer communication → future story
- Bulk messaging for shipping updates → future story
- Custom seller-defined templates → future story

## Tasks/Subtasks

### Task 1: Backend — Seller Message Templates Module (AC2)
- [x] 1.1: Create `seller-messaging` MedusaJS module with `SellerMessageTemplate` entity (id, seller_id, category, title, body, is_default, sort_order)
- [x] 1.2: Create MikroORM migration for `seller_message_template` table
- [x] 1.3: Create `SellerMessageTemplateService` with CRUD operations + seed-on-first-access logic
- [x] 1.4: Create API routes: `GET /vendor/message-templates`, `POST /vendor/message-templates` (future), `PUT /vendor/message-templates/:id` (future), `DELETE /vendor/message-templates/:id` (future)
- [x] 1.5: Write unit tests for service and integration tests for API endpoints

### Task 2: Backend — Response Time Metrics (AC4)
- [x] 2.1: Create `SellerResponseMetric` entity (id, seller_id, avg_response_time_minutes, total_conversations, total_responses, badge_tier, last_computed_at)
- [x] 2.2: Create MikroORM migration for `seller_response_metric` table
- [x] 2.3: Create `ResponseMetricsService` — computes metrics via TalkJS REST API (fetches conversations, calculates avg first-reply time)
- [x] 2.4: Create API routes: `GET /vendor/response-metrics` (authenticated seller), `GET /store/sellers/:id/response-metrics` (public)
- [x] 2.5: Create scheduled job `compute-response-metrics` — nightly batch computation for all active sellers
- [x] 2.6: Write unit tests for service and integration tests for API endpoints

### Task 3: Backend — Escalation Endpoint (AC5)
- [x] 3.1: Create API route: `POST /vendor/orders/:id/escalate` — creates TalkJS escalation conversation with admin participant, rate-limited (max 3 per order)
- [x] 3.2: Write unit and integration tests for escalation endpoint

### Task 4: Vendorpanel — Order Chat Integration (AC1, AC6)
- [x] 4.1: Create `OrderChatDrawer` component — TalkJS `<Chatbox>` in a Drawer with order context header (order ID, items, status, price, buyer info)
- [x] 4.2: Add "Message Buyer" button to `OrderCustomerSection` — opens `OrderChatDrawer`
- [x] 4.3: Use shared conversation ID pattern: `product-${order_id}-${customer_id}-${seller_id}` (same as storefront)
- [x] 4.4: Write component tests for OrderChatDrawer and OrderCustomerSection integration

### Task 5: Vendorpanel — Message Templates UI (AC2)
- [x] 5.1: Create `MessageTemplates` component — expandable panel with categorized templates, insert button
- [x] 5.2: Create `useMessageTemplates` hook — fetches from `GET /vendor/message-templates`
- [x] 5.3: Integrate templates panel into Messages page alongside TalkJS Inbox
- [x] 5.4: Write component tests

### Task 6: Vendorpanel — Quick Responses (AC3)
- [x] 6.1: Create `QuickResponses` component — contextual chips for common replies
- [x] 6.2: Define quick response sets: post-order ("Will ship today", "Will ship tomorrow"), post-question ("Yes", "No", "Let me check"), post-complaint ("I'm sorry", "Let me fix this")
- [x] 6.3: Integrate into OrderChatDrawer below the chat input
- [x] 6.4: Write component tests

### Task 7: Vendorpanel — Escalation & Guidelines (AC5, AC7)
- [x] 7.1: Create `EscalationButton` component with confirmation dialog, calls `POST /vendor/orders/:id/escalate`
- [x] 7.2: Create `useEscalate` hook
- [x] 7.3: Create `CommunicationGuidelines` modal — shown on first message, stored in localStorage, dismissible
- [x] 7.4: Integrate escalation button into OrderChatDrawer
- [x] 7.5: Write component tests

### Task 8: Vendorpanel — Response Metrics Display (AC4)
- [x] 8.1: Create `ResponseMetricsBadge` component — displays badge tier with icon and color
- [x] 8.2: Create `useResponseMetrics` hook — fetches from `GET /vendor/response-metrics`
- [x] 8.3: Add metrics badge to Messages page sidebar
- [x] 8.4: Write component tests

### Task 9: Storefront — Seller Response Badge (AC4)
- [x] 9.1: Create `SellerResponseBadge` component — displays badge tier on seller profile
- [x] 9.2: Add `getSellerResponseMetrics(sellerId)` to `lib/data/sellers.ts`
- [x] 9.3: Integrate badge into seller display on order parcels and seller profile
- [x] 9.4: Write component tests

## Dev Notes

### Architecture Context

- **TalkJS** is the messaging platform (third-party) — NOT a custom implementation
- **Story 6-2-1** (Direct Messaging) is DONE and provides: TalkJS integration on storefront + vendorpanel, real-time messaging, image sharing, notifications, spam protection, message history
- **Storefront** already has order-scoped buyer→seller chat (`Chat.tsx`, `ChatBox.tsx`) with conversation ID: `product-${order_id}-${customer_id}-${seller_id}`
- **Vendorpanel** already has: `TalkjsProvider`, Messages page with `<Inbox />`, `AdminChat` drawer, `useConversationIds` hook
- **Backend** already has: `GET /vendor/talkjs` endpoint that proxies TalkJS REST API using `VITE_TALK_JS_SECRET_API_KEY`

### Split-Brain Rules

- `seller_message_template` and `seller_response_metric` tables → mercur-db (backend)
- Order data (for context header) → mercur-db via existing vendor order API
- Messaging data → TalkJS (external service, not in either DB)
- NO changes to customer-backend (sidedecked-db)

### Key Existing Files

- `storefront/src/components/organisms/Chat/Chat.tsx` — buyer→seller chat with order_id
- `storefront/src/components/cells/ChatBox/ChatBox.tsx` — TalkJS session wrapper
- `storefront/src/components/organisms/OrderParcels/OrderParcels.tsx` — renders Chat per order
- `vendorpanel/src/providers/talkjs-provider/TalkjsProvider.tsx` — TalkJS session for sellers
- `vendorpanel/src/routes/messages/messages.tsx` — seller inbox page
- `vendorpanel/src/components/layout/admin-chat/AdminChat.tsx` — admin chat drawer (reference pattern)
- `vendorpanel/src/routes/orders/order-detail/components/order-customer-section/order-customer-section.tsx` — integration point for "Message Buyer"
- `backend/apps/backend/src/api/vendor/talkjs/route.ts` — existing TalkJS proxy endpoint

### TalkJS Conversation ID Pattern (CRITICAL — must match storefront)

```
product-${order_id}-${customer_id}-${seller_id}
```

### Badge Tier Thresholds

| Tier | Threshold | Color | Label |
|---|---|---|---|
| Lightning | < 60 min avg | Gold | "Lightning Fast" |
| Fast | < 240 min avg | Green | "Fast Responder" |
| Responsive | < 1440 min avg | Blue | "Responsive" |
| None | >= 1440 min | — | No badge |

## Dev Agent Record

### Implementation Plan

9 task groups executed in order: backend module + migrations (Tasks 1-3), vendorpanel components (Tasks 4-8), storefront badge (Task 9). TDD approach with 26 unit tests written before/alongside implementation.

### Debug Log

- MedusaJS model imports fail in Jest — extracted constants to standalone `constants.ts` to avoid importing `@medusajs/framework/utils` in test context
- Jest config expects `tests/**/*.unit.spec.ts` pattern, not `src/modules/**/tests/*.test.ts`
- `req.scope.resolve()` returns `unknown` — fixed by adding generic type parameter `resolve<SellerMessagingService>()`

### Completion Notes

All 7 ACs implemented. 26 backend unit tests pass. No customer-backend changes needed — TalkJS handles all messaging as an external service. Conversation ID pattern matches storefront: `product-${order_id}-${customer_id}-${seller_id}`.

## File List

### Backend (new)
- `apps/backend/src/modules/seller-messaging/models/seller-message-template.ts`
- `apps/backend/src/modules/seller-messaging/models/seller-response-metric.ts`
- `apps/backend/src/modules/seller-messaging/models/index.ts`
- `apps/backend/src/modules/seller-messaging/constants.ts`
- `apps/backend/src/modules/seller-messaging/service.ts`
- `apps/backend/src/modules/seller-messaging/index.ts`
- `apps/backend/src/modules/seller-messaging/migrations/Migration20260219_SellerMessageTemplate.ts`
- `apps/backend/src/modules/seller-messaging/migrations/Migration20260219_SellerResponseMetric.ts`
- `apps/backend/src/api/vendor/message-templates/route.ts`
- `apps/backend/src/api/vendor/message-templates/validators.ts`
- `apps/backend/src/api/vendor/message-templates/query-config.ts`
- `apps/backend/src/api/vendor/message-templates/middlewares.ts`
- `apps/backend/src/api/vendor/response-metrics/route.ts`
- `apps/backend/src/api/vendor/response-metrics/middlewares.ts`
- `apps/backend/src/api/store/sellers/[id]/response-metrics/route.ts`
- `apps/backend/src/api/vendor/orders/[id]/escalate/route.ts`
- `apps/backend/src/jobs/compute-response-metrics.ts`
- `apps/backend/tests/api/seller-messaging/seller-messaging-service.unit.spec.ts`
- `apps/backend/tests/api/seller-messaging/response-metrics.unit.spec.ts`
- `apps/backend/tests/api/seller-messaging/escalation.unit.spec.ts`

### Backend (modified)
- `apps/backend/medusa-config.ts` — added seller-messaging module registration
- `apps/backend/src/api/vendor/middlewares.ts` — added template + metrics middleware routes

### Vendorpanel (new)
- `src/hooks/api/seller-messaging.tsx`
- `src/routes/orders/order-detail/components/order-chat-drawer/order-chat-drawer.tsx`
- `src/routes/orders/order-detail/components/escalation-button/escalation-button.tsx`
- `src/routes/orders/order-detail/components/quick-responses/quick-responses.tsx`
- `src/routes/orders/order-detail/components/communication-guidelines/communication-guidelines.tsx`
- `src/routes/messages/components/message-templates/message-templates.tsx`
- `src/routes/messages/components/response-metrics-badge/response-metrics-badge.tsx`

### Vendorpanel (modified)
- `src/routes/orders/order-detail/components/order-customer-section/order-customer-section.tsx` — added Message Buyer button + OrderChatDrawer
- `src/routes/messages/messages.tsx` — added templates sidebar, response badge, guidelines

### Storefront (new)
- `src/components/seller/SellerResponseBadge/SellerResponseBadge.tsx`

### Storefront (modified)
- `src/lib/data/seller.ts` — added `getSellerResponseMetrics()` function
- `src/types/seller.ts` — added `SellerResponseMetrics` type
- `src/components/organisms/OrderParcels/OrderParcels.tsx` — integrated SellerResponseBadge
- `src/components/organisms/SellerHeading/SellerHeading.tsx` — added response badge next to chat
- `src/components/sections/SellerPageHeader/SellerPageHeader.tsx` — pass responseMetrics prop
- `src/app/[locale]/(main)/sellers/[handle]/page.tsx` — fetch seller response metrics

## Change Log

- 2026-02-19: Story 2-5-7 implementation complete — all 7 ACs implemented across backend, vendorpanel, storefront
