# Fix Consumer-Seller Customer Linkage — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all consumer-seller API routes that 500 because `Seller.member_customer_id` doesn't exist, by adding `customer_id` to the `Member` model and rewriting seller lookups.

**Architecture:** Add a nullable `customer_id` text column to the existing `Member` model (Seller → Member hasMany). The upgrade route creates both Seller + Member records. All consumer-seller routes use a shared utility that queries via `query.graph({ entity: 'seller', filters: { members: { customer_id } } })` — the same pattern the vendor panel uses with `members.id`.

**Tech Stack:** MedusaJS v2 (MercurJS) · MikroORM · TypeScript · Vitest/Jest

---

### Task 1: Add `customer_id` to the Member model and DTO types

**Files:**
- Modify: `backend/packages/modules/seller/src/models/member.ts:6-15`
- Modify: `backend/packages/framework/src/types/seller/common.ts:64-75`
- Modify: `backend/packages/framework/src/types/seller/mutations.ts:33-41`

**Step 1: Add `customer_id` field to Member model**

In `backend/packages/modules/seller/src/models/member.ts`, add `customer_id` before the `seller` relation:

```typescript
import { model } from "@medusajs/framework/utils";

import { MemberRole } from "@mercurjs/framework";
import { Seller } from "./seller";

export const Member = model.define("member", {
  id: model.id({ prefix: "mem" }).primaryKey(),
  role: model.enum(MemberRole).default(MemberRole.OWNER),
  name: model.text().searchable(),
  email: model.text().nullable(),
  bio: model.text().searchable().nullable(),
  phone: model.text().searchable().nullable(),
  photo: model.text().nullable(),
  customer_id: model.text().nullable(),
  seller: model.belongsTo(() => Seller, { mappedBy: "members" }),
});
```

**Step 2: Add `customer_id` to `MemberDTO` type**

In `backend/packages/framework/src/types/seller/common.ts`, add to `MemberDTO`:

```typescript
export type MemberDTO = {
  id: string;
  created_at: Date;
  updated_at: Date;
  role: MemberRole;
  email: string | null;
  name: string | null;
  bio: string | null;
  photo: string | null;
  phone: string | null;
  customer_id: string | null;
  seller?: Partial<SellerDTO>;
};
```

**Step 3: Add `customer_id` to `CreateMemberDTO` and `UpdateMemberDTO`**

In `backend/packages/framework/src/types/seller/mutations.ts`:

```typescript
export interface CreateMemberDTO {
  seller_id: string
  role?: MemberRole
  name: string
  email: string
  bio?: string
  photo?: string
  phone?: string
  customer_id?: string
}

export interface UpdateMemberDTO {
  id: string
  role?: MemberRole
  name?: string
  email?: string
  bio?: string
  photo?: string
  phone?: string
  customer_id?: string
}
```

**Step 4: Commit**

```bash
git add backend/packages/modules/seller/src/models/member.ts backend/packages/framework/src/types/seller/common.ts backend/packages/framework/src/types/seller/mutations.ts
git commit -m "feat(seller): add customer_id field to Member model and DTOs"
```

---

### Task 2: Create database migration

**Files:**
- Create: `backend/packages/modules/seller/src/migrations/Migration20260220120000.ts`

**Step 1: Create the migration file**

```typescript
import { Migration } from '@mikro-orm/migrations';

export class Migration20260220120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "member" add column if not exists "customer_id" text;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "member" drop column if exists "customer_id";`);
  }

}
```

**Step 2: Commit**

```bash
git add backend/packages/modules/seller/src/migrations/Migration20260220120000.ts
git commit -m "feat(seller): add migration for member.customer_id column"
```

---

### Task 3: Rewrite the shared `fetchConsumerSellerByCustomerId` utility

**Files:**
- Modify: `backend/apps/backend/src/api/store/consumer-seller/payout-account/utils.ts:29-47`

**Step 1: Rewrite the utility to use `query.graph`**

Replace `fetchConsumerSellerByCustomerId` with:

```typescript
export const fetchConsumerSellerByCustomerId = async (
  customerId: string,
  scope: MedusaContainer
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [seller] } = await query.graph({
    entity: 'seller',
    filters: {
      members: {
        customer_id: customerId,
      },
    },
    fields: ['id', 'name', 'handle', 'seller_tier', 'store_status'],
  })

  if (!seller) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'Customer is not registered as a seller'
    )
  }

  return seller
}
```

The import for `SELLER_MODULE` and `SellerModuleService` can be removed from this file since the rewritten function no longer uses `sellerService.listSellers`. Keep the existing `ContainerRegistrationKeys` and `MedusaError` imports, and the `refetchPayoutAccount` function unchanged.

Full file should be:

```typescript
import { MedusaContainer } from '@medusajs/framework'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'

import sellerPayoutAccountLink from '../../../../links/seller-payout-account'

export const refetchPayoutAccount = async (
  container: MedusaContainer,
  fields: string[],
  filters: Record<string, unknown>
) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [sellerPayoutAccount]
  } = await query.graph(
    {
      entity: sellerPayoutAccountLink.entryPoint,
      fields,
      filters
    },
    { throwIfKeyNotFound: true }
  )

  return sellerPayoutAccount
}

export const fetchConsumerSellerByCustomerId = async (
  customerId: string,
  scope: MedusaContainer
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [seller] } = await query.graph({
    entity: 'seller',
    filters: {
      members: {
        customer_id: customerId,
      },
    },
    fields: ['id', 'name', 'handle', 'seller_tier', 'store_status'],
  })

  if (!seller) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'Customer is not registered as a seller'
    )
  }

  return seller
}
```

**Step 2: Commit**

```bash
git add backend/apps/backend/src/api/store/consumer-seller/payout-account/utils.ts
git commit -m "fix(consumer-seller): rewrite seller lookup to use query.graph with members.customer_id"
```

---

### Task 4: Fix the upgrade route to create Seller + Member

**Files:**
- Modify: `backend/apps/backend/src/api/store/consumer-seller/upgrade/route.ts`

**Step 1: Rewrite the upgrade route**

The route must: (a) check for existing seller via the shared utility, (b) create Seller, (c) create Member with `customer_id`. Replace the full `POST` handler body:

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { toHandle } from '@medusajs/framework/utils'
import { SELLER_MODULE, SellerModuleService } from '@mercurjs/seller'
import { MedusaError } from '@medusajs/framework/utils'
import { StoreConsumerSellerUpgradeType } from '../validators'

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreConsumerSellerUpgradeType>,
  res: MedusaResponse
) => {
  const customer_id = req.auth_context.actor_id
  const { seller_type, display_name } = req.body
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Check if customer already has a seller via member.customer_id
    const { data: existingSellers } = await query.graph({
      entity: 'seller',
      filters: {
        members: {
          customer_id: customer_id,
        },
      },
      fields: ['id'],
    })

    if (existingSellers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Customer is already registered as a seller',
        seller_id: existingSellers[0].id,
      })
    }

    // Create seller
    const seller = await sellerService.createSellers({
      name: display_name,
      handle: `${toHandle(display_name)}-${customer_id}`,
      seller_tier: seller_type === 'business' ? 'business' : 'consumer',
      store_status: 'active',
      auto_approved: true,
      verification_method: 'self_certification',
      description: `${seller_type === 'business' ? 'Business' : 'Individual'} seller account for ${display_name}`,
    } as any)

    // Create member linked to customer
    await sellerService.createMembers({
      seller_id: seller.id,
      name: display_name,
      email: '',
      role: 'owner',
      customer_id: customer_id,
    } as any)

    return res.status(201).json({
      success: true,
      message: 'Successfully registered as a seller',
      seller_id: seller.id,
      seller_tier: seller_type,
      store_status: 'active',
    })
  } catch (error: any) {
    logger.error(`[consumer-seller/upgrade] Error creating seller for customer ${customer_id}: ${error?.message}`)

    if (error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
      return res.status(409).json({
        success: false,
        message: 'Customer is already registered as a seller',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to register seller account',
    })
  }
}
```

**Step 2: Commit**

```bash
git add backend/apps/backend/src/api/store/consumer-seller/upgrade/route.ts
git commit -m "fix(consumer-seller): upgrade route creates Member with customer_id"
```

---

### Task 5: Fix dashboard route

**Files:**
- Modify: `backend/apps/backend/src/api/store/consumer-seller/dashboard/route.ts:1-35`

**Step 1: Replace seller lookup with shared utility**

Replace lines 1-5 imports and lines 28-44 (seller lookup block) to use `fetchConsumerSellerByCustomerId`. Remove `SELLER_MODULE` and `SellerModuleService` imports, add import for the utility.

Change the import block to:

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { fetchConsumerSellerByCustomerId } from '../payout-account/utils'
```

Replace lines 28-44 (inside the try block, the seller lookup) with:

```typescript
    const seller = await fetchConsumerSellerByCustomerId(customerId, req.scope)
```

Remove the `sellerService` resolve and the `if (!sellers.length)` check — the utility throws `NOT_FOUND` if no seller exists. Add a catch for `MedusaError` with type `NOT_FOUND` that returns 404:

In the outer catch block, add before the generic 500:

```typescript
  } catch (error: any) {
    logger.error(`[consumer-seller/dashboard] Error: ${error?.message}`)
    if (error?.type === 'not_found') {
      return res.status(404).json({
        success: false,
        message: 'Customer is not registered as a seller',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
    })
  }
```

**Step 2: Commit**

```bash
git add backend/apps/backend/src/api/store/consumer-seller/dashboard/route.ts
git commit -m "fix(consumer-seller): dashboard uses shared seller lookup utility"
```

---

### Task 6: Fix listings routes (GET + POST)

**Files:**
- Modify: `backend/apps/backend/src/api/store/consumer-seller/listings/route.ts:1-5,46-61,206-222`

**Step 1: Replace seller lookups in both GET and POST handlers**

Change the import block to:

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, ProductStatus, toHandle } from '@medusajs/framework/utils'
import { createProductsWorkflow } from '@medusajs/medusa/core-flows'

import { StoreCreateConsumerSellerListingType } from '../validators'
import { fetchConsumerSellerByCustomerId } from '../payout-account/utils'
```

Remove the `SELLER_MODULE` and `SellerModuleService` imports.

In the `GET` handler, replace lines 46-61 (sellerService resolve + listSellers + empty check) with:

```typescript
    const seller = await fetchConsumerSellerByCustomerId(customerId, req.scope)
```

In the `POST` handler, replace lines 206-222 (same pattern) with:

```typescript
    const seller = await fetchConsumerSellerByCustomerId(customerId, req.scope)
```

In both catch blocks, add `not_found` handling before the 500:

```typescript
    if (error?.type === 'not_found') {
      return res.status(404).json({
        success: false,
        message: 'Customer is not registered as a seller',
      })
    }
```

**Step 2: Commit**

```bash
git add backend/apps/backend/src/api/store/consumer-seller/listings/route.ts
git commit -m "fix(consumer-seller): listings routes use shared seller lookup"
```

---

### Task 7: Fix listings [id] routes (PUT + DELETE)

**Files:**
- Modify: `backend/apps/backend/src/api/store/consumer-seller/listings/[id]/route.ts:1-3,44-58,149-163`

**Step 1: Replace seller lookups in both PUT and DELETE handlers**

Change the import block to:

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

import { fetchConsumerSellerByCustomerId } from '../../payout-account/utils'
```

Remove `SELLER_MODULE` and `SellerModuleService` imports.

In both `PUT` and `DELETE` handlers, replace the sellerService + listSellers + empty check with:

```typescript
    const seller = await fetchConsumerSellerByCustomerId(customerId, req.scope)
```

Add `not_found` handling in both catch blocks.

**Step 2: Commit**

```bash
git add backend/apps/backend/src/api/store/consumer-seller/listings/[id]/route.ts
git commit -m "fix(consumer-seller): listing detail routes use shared seller lookup"
```

---

### Task 8: Fix orders route

**Files:**
- Modify: `backend/apps/backend/src/api/store/consumer-seller/orders/route.ts:1-3,37-50`

**Step 1: Replace seller lookup with shared utility**

Change imports:

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

import { fetchConsumerSellerByCustomerId } from '../payout-account/utils'
```

Replace sellerService + listSellers + empty check with:

```typescript
    const seller = await fetchConsumerSellerByCustomerId(customerId, req.scope)
```

Add `not_found` handling in catch block.

**Step 2: Commit**

```bash
git add backend/apps/backend/src/api/store/consumer-seller/orders/route.ts
git commit -m "fix(consumer-seller): orders route uses shared seller lookup"
```

---

### Task 9: Update unit tests

**Files:**
- Modify: `backend/apps/backend/tests/api/consumer-seller/payout-utils.unit.spec.ts`

**Step 1: Rewrite `fetchConsumerSellerByCustomerId` tests**

The function now uses `query.graph` instead of `sellerService.listSellers`. Update the test to mock `query.graph`:

```typescript
import { MedusaError } from '@medusajs/framework/utils'

const mockGraphQuery = jest.fn()

jest.mock('@medusajs/framework/utils', () => {
  const actual = jest.requireActual('@medusajs/framework/utils')
  return {
    ...actual,
    ContainerRegistrationKeys: {
      QUERY: 'query',
      LOGGER: 'logger'
    }
  }
})

jest.mock('../../../src/links/seller-payout-account', () => ({
  __esModule: true,
  default: { entryPoint: 'seller_payout_account' }
}))

import {
  fetchConsumerSellerByCustomerId,
  refetchPayoutAccount
} from '../../../src/api/store/consumer-seller/payout-account/utils'

function createMockScope(overrides: Record<string, any> = {}) {
  return {
    resolve: jest.fn((key: string) => {
      if (key === 'query') {
        return { graph: mockGraphQuery }
      }
      return overrides[key]
    })
  } as any
}

describe('fetchConsumerSellerByCustomerId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return seller when found by customer ID', async () => {
    const mockSeller = { id: 'seller_01', name: 'Test Seller' }
    mockGraphQuery.mockResolvedValue({ data: [mockSeller] })

    const result = await fetchConsumerSellerByCustomerId(
      'cus_123',
      createMockScope()
    )

    expect(result).toEqual(mockSeller)
    expect(mockGraphQuery).toHaveBeenCalledWith({
      entity: 'seller',
      filters: {
        members: {
          customer_id: 'cus_123',
        },
      },
      fields: ['id', 'name', 'handle', 'seller_tier', 'store_status'],
    })
  })

  it('should throw NOT_FOUND when no seller found', async () => {
    mockGraphQuery.mockResolvedValue({ data: [] })

    await expect(
      fetchConsumerSellerByCustomerId('cus_nonexistent', createMockScope())
    ).rejects.toThrow('Customer is not registered as a seller')
  })
})

describe('refetchPayoutAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should query seller-payout-account link with correct fields and filters', async () => {
    const mockPayoutAccount = {
      payout_account: { id: 'pacc_01', status: 'active' }
    }
    mockGraphQuery.mockResolvedValue({
      data: [mockPayoutAccount]
    })

    const result = await refetchPayoutAccount(
      createMockScope(),
      ['payout_account.id', 'payout_account.status'],
      { seller_id: 'seller_01' }
    )

    expect(result).toEqual(mockPayoutAccount)
    expect(mockGraphQuery).toHaveBeenCalledWith(
      {
        entity: 'seller_payout_account',
        fields: ['payout_account.id', 'payout_account.status'],
        filters: { seller_id: 'seller_01' }
      },
      { throwIfKeyNotFound: true }
    )
  })

  it('should throw when no payout account found (throwIfKeyNotFound)', async () => {
    mockGraphQuery.mockRejectedValue(new Error('Key not found'))

    await expect(
      refetchPayoutAccount(
        createMockScope(),
        ['payout_account.id'],
        { seller_id: 'seller_nonexistent' }
      )
    ).rejects.toThrow('Key not found')
  })
})
```

**Step 2: Run tests**

```bash
cd backend && npx jest tests/api/consumer-seller/payout-utils.unit.spec.ts --verbose
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add backend/apps/backend/tests/api/consumer-seller/payout-utils.unit.spec.ts
git commit -m "test(consumer-seller): update payout-utils tests for query.graph lookup"
```

---

### Task 10: Build + lint + typecheck verification

**Step 1: Run full quality gate in the backend**

```bash
cd backend && npm run lint --workspace=apps/backend && npm run typecheck --workspace=apps/backend && npm run build --workspace=apps/backend
```

Expected: All pass with 0 errors.

**Step 2: Run all consumer-seller tests**

```bash
cd backend && npx jest tests/api/consumer-seller/ --verbose
```

Expected: All pass.

**Step 3: Final commit if any fixes were needed**

```bash
git add -A && git commit -m "fix(consumer-seller): address lint/type issues from customer linkage fix"
```

---

### Task 11: Run migration on Railway (production)

**Step 1: Deploy and run migration**

After merging, the migration runs automatically on deploy. If manual:

```bash
cd backend && npm run db:migrate --workspace=apps/backend
```

**Step 2: Verify in Railway logs**

```bash
cd storefront && railway logs 2>&1 | grep -i "seller-dashboard\|consumer-seller\|500"
```

Expected: No more `member_customer_id` errors. Dashboard returns 404 (no sellers yet with customer_id) or 200 (after a new upgrade).
