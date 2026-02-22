# User Profile Management Implementation Plan

> **For the implementing agent:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow registered users to manage their display name, avatar, TCG game preferences, and shipping address, with a first-login onboarding modal.
**Story:** story-1-2 — source: `_bmad-output/planning-artifacts/epics.md` → "Story 1.2: User Profile Management"
**Note:** No story file exists yet (status: backlog). Create `_bmad-output/implementation-artifacts/story-1-2-user-profile-management.md` as first task using the SM create-story workflow, OR derive ACs directly from epics.md section quoted below.
**Domain:** Customer Experience (TCG preferences) + Commerce (display name, avatar, shipping address)
**Repos:** `customer-backend/`, `backend/`, `storefront/`
**Deployment:** true — new storefront pages, new backend media endpoint, new customer-backend API endpoint

---

## Requirements Brief (from Phase 2)

### Acceptance Criteria (from epics.md Story 1.2)

**AC1:** Authenticated user navigates to profile settings → can view and edit display name, avatar, and shipping address.

**AC2:** New user after first OAuth login → prompted (single-step modal) to set a display name and select preferred TCG games (multi-select: MTG, Pokemon, Yu-Gi-Oh!, One Piece). Skip allowed. Shipping address is **optional at onboarding** (required only at checkout, Epic 5).

**AC3:** User saves profile changes → profile is persisted and a toast confirmation appears.

**AC4:** Required fields left empty on save attempt → inline validation errors with clear guidance.

### Business Rules

- **Display name:** Required after first set. Min 3, max 30 chars. Alphanumeric + underscores + hyphens. Unique across platform — check on blur.
- **Avatar:** JPG/PNG/WebP only, max 5MB. Uploaded to MinIO via backend. URL stored in `customer_profile.avatar_url` (mercur-db).
- **TCG preferences:** Optional multi-select array stored in `user_profiles.favorite_games` (sidedecked-db).
- **Shipping address:** Single address for MVP. Fields: full name, address_1, address_2 (optional), city, province, postal_code, country_code. Stored via MedusaJS native `/store/customers/me/addresses`.
- **Onboarding trigger:** Show modal when `customer_profile.display_name` is null — no separate flag needed. Once display_name is saved, modal never shows again.
- **Onboarding dismissal:** User can skip; they retain access to the platform and can set preferences later from settings.

### UX Flows

**Onboarding modal (new user, post-OAuth):**
```
display_name null detected → Full-screen Dialog (shadcn/ui)
  Step 1 (only step):
    - "Pick your games" → checkbox group (MTG, Pokemon, Yu-Gi-Oh!, One Piece) with game logos
    - "Set your display name" → Input with real-time uniqueness check on blur
    - [Get Started] → saves both → redirects to storefront
    - [Skip for now] → closes modal without saving
```

**Profile settings page (`/settings/profile`):**
```
Avatar (circular) + click-to-upload → preview before save
Display Name * → Input + uniqueness check on blur
Preferred Games → checkbox multi-select
Shipping Address (optional) → full address form
[Save Changes] → parallel API calls → sonner toast on success
Inline validation via React Hook Form + Zod
```

---

## Technical Design (from Phase 3)

### Domain Routing

| Data | Repo | DB | API |
|---|---|---|---|
| display_name, avatar_url | `backend/` | mercur-db | PATCH /store/auth/profile (existing) |
| Avatar file upload | `backend/` | MinIO | POST /store/media/avatar (new) |
| favorite_games | `customer-backend/` | sidedecked-db | PATCH /api/user-profiles/me (new) |
| shipping_address | `backend/` | mercur-db | POST /store/customers/me/addresses (MedusaJS native) |
| Profile UI | `storefront/` | — | — |

### Schema Change (sidedecked-db only)

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS favorite_games TEXT[] DEFAULT '{}';
```

No new tables. `customer_profile` in mercur-db already has `display_name` and `avatar_url` columns.

### API Contracts

```typescript
// Existing — backend (mercur-db)
GET  /store/auth/profile           → { display_name, avatar_url, username, ... }
PATCH /store/auth/profile          body: { display_name?, avatar_url? }
POST /store/customers/me/addresses body: { first_name, last_name, address_1, city, province, postal_code, country_code }

// New — backend (MinIO upload)
POST /store/media/avatar           multipart/form-data { file }  → { url: string }

// New — customer-backend (sidedecked-db)
GET  /api/user-profiles/me         → { id, customer_id, favorite_games, ... }
PATCH /api/user-profiles/me        body: { favorite_games? }     → { updated profile }
```

### Integration Touchpoints

- **MinIO:** avatar upload via new backend endpoint
- **Sonner:** toast on profile save (installed via shadcn/ui — no extra packages)
- Stripe, Algolia, Redis, Resend: not involved

### Storefront Data Fetch Pattern

Profile settings page fires two parallel calls:
```typescript
const [profile, userProfile] = await Promise.all([
  getAuthProfile(),        // GET /store/auth/profile      (backend)
  getUserProfile(),        // GET /api/user-profiles/me    (customer-backend)
])
```

---

## Prerequisites

Before starting Task 1, verify:
- [ ] `customer_profile` table exists in mercur-db with `display_name TEXT` and `avatar_url TEXT` columns
- [ ] `PATCH /store/auth/profile` endpoint exists and is functional in backend
- [ ] MinIO is configured in backend environment (`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_AVATARS`)
- [ ] `user_profiles` table exists in sidedecked-db (community package)

---

## Task 1: customer-backend — Add favorite_games migration + API

**Goal:** Persist TCG game preferences for a user in sidedecked-db.

**Files to create/modify:**
- `customer-backend/apps/api/src/migrations/{timestamp}-add-favorite-games-to-user-profiles.ts` ← NEW
- `customer-backend/packages/community/src/entities/user-profile.entity.ts` ← MODIFY: add `favorite_games`
- `customer-backend/apps/api/src/controllers/user-profile.controller.ts` ← MODIFY: add GET/PATCH /me routes
- `customer-backend/apps/api/src/services/user-profile.service.ts` ← MODIFY: add updateFavoriteGames logic
- `customer-backend/apps/api/src/controllers/__tests__/user-profile.controller.test.ts` ← NEW/MODIFY

**TDD steps:**
1. Write failing tests:
   - `PATCH /api/user-profiles/me` with `{ favorite_games: ['MTG', 'POKEMON'] }` → 200 with updated profile
   - `PATCH /api/user-profiles/me` with invalid game code → 422
   - `GET /api/user-profiles/me` → 200 with `favorite_games` array
2. Run tests → confirm failures
3. Create migration (add `favorite_games TEXT[] DEFAULT '{}'` to `user_profiles`)
4. Run migration: `npm run migration:run`
5. Update UserProfile entity with `@Column('text', { array: true, default: [] }) favoriteGames: string[]`
6. Add `updateFavoriteGames(customerId, games)` to service with validation (must be subset of `['MTG', 'POKEMON', 'YUGIOH', 'OPTCG']`)
7. Add GET /api/user-profiles/me and PATCH /api/user-profiles/me to controller (auth middleware required)
8. Run tests → confirm pass
9. Run quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
10. Commit: `feat(user-profile): add favorite_games field and profile API endpoints`

---

## Task 2: backend — Avatar upload endpoint (MinIO)

**Goal:** Authenticated users can upload a profile avatar; backend stores it in MinIO and returns the URL.

**Files to create/modify:**
- `backend/apps/backend/src/api/store/media/avatar/route.ts` ← NEW
- `backend/apps/backend/src/modules/media/` ← NEW or extend existing: MinIO upload service
- `backend/apps/backend/src/api/store/media/avatar/__tests__/route.test.ts` ← NEW

**TDD steps:**
1. Write failing tests:
   - `POST /store/media/avatar` with valid JPG → 200 with `{ url: string }`
   - `POST /store/media/avatar` without auth → 401
   - `POST /store/media/avatar` with file > 5MB → 413
   - `POST /store/media/avatar` with invalid type (PDF) → 422
2. Run tests → confirm failures
3. Implement MinIO upload service: validate file type + size, generate unique filename (`avatars/{customerId}/{uuid}.{ext}`), upload to MinIO bucket, return public HTTPS URL
4. Implement route handler using `MedusaStoreRequest` pattern; parse multipart form data
5. Run tests → confirm pass
6. Run quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
7. Commit: `feat(media): add avatar upload endpoint with MinIO storage`

---

## Task 3: storefront — Profile API client

**Goal:** Centralise all profile-related API calls in a typed client module.

**Files to create/modify:**
- `storefront/src/lib/api/profile.ts` ← NEW
- `storefront/src/lib/api/__tests__/profile.test.ts` ← NEW

**TDD steps:**
1. Write failing tests for each function:
   - `getAuthProfile()` → calls GET /store/auth/profile, returns typed profile
   - `updateAuthProfile(data)` → calls PATCH /store/auth/profile
   - `uploadAvatar(file)` → calls POST /store/media/avatar, returns URL string
   - `getUserProfile()` → calls GET /api/user-profiles/me, returns typed profile
   - `updateUserProfile(data)` → calls PATCH /api/user-profiles/me
   - `addShippingAddress(address)` → calls POST /store/customers/me/addresses
2. Run tests → confirm failures
3. Implement all functions with proper auth headers, error handling at system boundaries only
4. Run tests → confirm pass
5. Run quality gate: `npm run lint && npm run typecheck`
6. Commit: `feat(profile): add profile API client`

---

## Task 4: storefront — Profile settings page

**Goal:** Authenticated users can view and update display name, avatar, TCG preferences, and shipping address from `/settings/profile`.

**Files to create/modify:**
- `storefront/src/app/(main)/settings/profile/page.tsx` ← NEW (Next.js 14 server component wrapper)
- `storefront/src/components/profile/profile-settings-form.tsx` ← NEW (client component with form logic)
- `storefront/src/components/profile/avatar-upload.tsx` ← NEW
- `storefront/src/components/profile/shipping-address-form.tsx` ← NEW
- `storefront/src/components/profile/__tests__/profile-settings-form.test.tsx` ← NEW
- `storefront/src/components/profile/__tests__/avatar-upload.test.tsx` ← NEW

**Zod schema:**
```typescript
const profileSchema = z.object({
  display_name: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  favorite_games: z.array(z.enum(['MTG', 'POKEMON', 'YUGIOH', 'OPTCG'])),
  address: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    address_1: z.string().min(1),
    address_2: z.string().optional(),
    city: z.string().min(1),
    province: z.string().min(1),
    postal_code: z.string().min(1),
    country_code: z.string().length(2),
  }).optional(),
})
```

**TDD steps:**
1. Write failing tests:
   - Renders form with existing display_name pre-filled
   - Renders game checkboxes with existing preferences checked
   - Submit with empty display_name → shows inline validation error
   - Submit with valid data → fires API calls → shows sonner toast "Profile updated"
   - Avatar upload → preview shown before save
   - Avatar > 5MB → shows error message
2. Run tests → confirm failures
3. Implement page.tsx (server component): parallel fetch of `getAuthProfile()` + `getUserProfile()`, pass as props to client form
4. Implement profile-settings-form.tsx: React Hook Form + Zod, on submit → `Promise.all([updateAuthProfile, updateUserProfile, addShippingAddress?])`, sonner toast on success, field-level errors on failure
5. Implement avatar-upload.tsx: file input + preview (FileReader), validates type/size client-side before upload, on confirm → `uploadAvatar()` → `updateAuthProfile({ avatar_url })`
6. Run tests → confirm pass
7. Run quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
8. Commit: `feat(profile): add profile settings page with avatar upload and TCG preferences`

---

## Task 5: storefront — Onboarding modal

**Goal:** New users (display_name is null after OAuth) see a single-step modal to set display name and TCG preferences. Skip is available.

**Files to create/modify:**
- `storefront/src/components/profile/onboarding-modal.tsx` ← NEW (client component)
- `storefront/src/app/(main)/layout.tsx` ← MODIFY: add onboarding modal logic (check display_name on mount)
- `storefront/src/components/profile/__tests__/onboarding-modal.test.tsx` ← NEW

**TDD steps:**
1. Write failing tests:
   - Modal renders when `display_name` prop is null
   - Modal does NOT render when `display_name` has a value
   - "Skip for now" button → closes modal, no API calls fired
   - Submit with empty display_name → inline error shown, modal stays open
   - Submit with valid display_name (+ optional games) → calls API → modal closes
   - Display name uniqueness: blur event triggers server-side check → shows error if taken
2. Run tests → confirm failures
3. Implement onboarding-modal.tsx: shadcn/ui Dialog (no X close button, only Skip link at bottom), React Hook Form + Zod, game checkbox multi-select with game name labels, display name input with async uniqueness check on blur (`/store/auth/profile/check-username` or reuse display_name uniqueness via PATCH attempt)
4. Modify layout.tsx: read `authProfile.display_name` from server-side session; if null, render `<OnboardingModal />`
5. Run tests → confirm pass
6. Run quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
7. Commit: `feat(profile): add post-OAuth onboarding modal for new users`

---

## Task 6: Story file creation and AC tagging

**Goal:** Create the story-1-2 file and mark all acceptance criteria (IMPLEMENTED) once all tasks pass.

**Steps:**
1. Create `_bmad-output/implementation-artifacts/story-1-2-user-profile-management.md` from the SM create-story template (or copy story-1-1 structure)
2. Populate with ACs from epics.md Story 1.2 — mark all 4 ACs as `(IMPLEMENTED)` after verification
3. Update `_bmad-output/implementation-artifacts/sprint-status.yaml`: set `1-2-user-profile-management: done`
4. Commit: `docs(user-profile): mark story 1-2 implemented in sprint status`

---

## Quality Gate (run in each affected repo before PR)

```bash
# customer-backend/
npm run lint && npm run typecheck && npm run build && npm test
npm run test:coverage  # must be ≥ 80% on changed modules

# backend/
npm run lint && npm run typecheck && npm run build && npm test
npm run test:coverage

# storefront/
npm run lint && npm run typecheck && npm run build && npm test
npm run test:coverage
```

## Verification Checklist

- [ ] `PATCH /api/user-profiles/me` saves favorite_games to sidedecked-db
- [ ] `POST /store/media/avatar` uploads file to MinIO, returns URL
- [ ] `PATCH /store/auth/profile` saves display_name to mercur-db
- [ ] `/settings/profile` page renders with pre-filled data from both services
- [ ] Onboarding modal appears for users with null display_name
- [ ] Onboarding modal does NOT appear after display_name is saved
- [ ] Skip closes modal without API calls
- [ ] Toast appears on successful profile save
- [ ] Inline validation errors appear for empty required fields
- [ ] Avatar preview shown before save; file type/size validated client-side
- [ ] All 4 ACs from epics.md Story 1.2 verified and tagged (IMPLEMENTED)
- [ ] Sprint status updated to `done`
