# Pokemon TCGdex Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the dead `api.pokemontcg.io` endpoint with `api.tcgdex.net/v2/en`, switching from a single-paginated-query strategy to a set-based fetch strategy (fetch all sets → cards per set → individual card detail).

**Architecture:** TCGdex requires 3-tier fetching: list all sets → get card IDs per set → fetch full card object per ID. For weekly incremental runs, sets are filtered by `releaseDate=like:YYYY-MM` to only process newly released sets. Concurrency is managed with `p-queue` (already a project dependency) to politely throttle individual card fetches.

**Tech Stack:** axios (existing), p-queue (existing), TCGdex REST API `https://api.tcgdex.net/v2/en` (free, no API key)

---

## TCGdex vs pokemontcg.io Field Mapping

| Old field | New field | Notes |
|---|---|---|
| `supertype` | `category` | "Pokemon" / "Trainer" / "Energy" (no accent) |
| `number` | `localId` | Collector number |
| `hp` (string) | `hp` (number) | Already a number, remove `parseInt` |
| `evolvesFrom` | `evolveFrom` | Dropped the 's' |
| `subtypes[]` | `stage` (string) | Single value: "Basic", "Stage1", "Stage2", "VSTAR", "VMAX", "GX", "EX" |
| `abilities[].text` | `abilities[].effect` | |
| `attacks[].text` | `attacks[].effect` | |
| `attacks[].damage` (string) | `attacks[].damage` (number) | |
| `convertedRetreatCost` (number) | `retreat` (number) | |
| `retreatCost` (array) | not present | Use `retreat` only |
| `legalities.standard` ("Legal") | `legal.standard` (boolean) | |
| `legalities.expanded` ("Legal") | `legal.expanded` (boolean) | |
| `images.small` / `images.large` | `image` base URL | Append `/low.webp` → small, `/high.webp` → large |
| `artist` | `illustrator` | |
| `set.ptcgoCode` | not in card's set object | Use `set.id.toUpperCase()` always |
| `set.series` | not in card's set object | Omit |
| `tcgplayer.prices.holofoil.market` | `pricing.tcgplayer.holofoil.marketPrice` | |
| `tcgplayer.prices.normal.market` | `pricing.tcgplayer.normal.marketPrice` | |
| `flavorText` | not in TCGdex | Omit |

## TCGdex API Endpoints Used

```
GET https://api.tcgdex.net/v2/en/sets?pagination:itemsPerPage=200
  → [{id, name, logo, cardCount}, ...]        (max ~200 sets total)

GET https://api.tcgdex.net/v2/en/sets/{setId}
  → {id, name, releaseDate, legal, cards: [{id, localId, name, image}, ...]}

GET https://api.tcgdex.net/v2/en/cards/{cardId}
  → full card object (see field mapping above)

Delta filter (incremental):
GET https://api.tcgdex.net/v2/en/sets?releaseDate=like:YYYY-MM&pagination:itemsPerPage=200
  → only sets released in that month
```

---

## Files to Modify

- `customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts`
- `customer-backend/src/tests/etl/transformers/PokemonTransformer.test.ts`
- No `package.json` changes (p-queue and axios already present)
- No env changes (`POKEMON_TCG_API_KEY` env var can be removed from `.env.example` but is not required)

---

## Task 1: Update interfaces in PokemonTransformer.ts

**Files:**
- Modify: `customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts`

Replace the `PokemonCard`, `PokemonApiResponse` interfaces with TCGdex shapes. Also add `TcgDexSetBrief` and `TcgDexSetDetail`.

**Step 1: Replace all interfaces at the top of the file**

Replace everything from the first `interface` through `interface PokemonApiResponse { ... }` with:

```typescript
import PQueue from 'p-queue'

interface TcgDexCard {
  id: string
  category: string          // "Pokemon" | "Trainer" | "Energy"
  name: string
  localId: string           // collector number
  hp?: number               // already a number
  types?: string[]
  evolveFrom?: string
  stage?: string            // "Basic" | "Stage1" | "Stage2" | "VSTAR" | "VMAX" | "GX" | "EX" | ...
  illustrator?: string
  rarity: string
  abilities?: Array<{
    type: string
    name: string
    effect: string          // was "text" in pokemontcg.io
  }>
  attacks?: Array<{
    cost?: string[]
    name: string
    effect?: string         // was "text" in pokemontcg.io
    damage?: number         // already a number
  }>
  weaknesses?: Array<{
    type: string
    value: string
  }>
  resistances?: Array<{
    type: string
    value: string
  }>
  retreat?: number          // was convertedRetreatCost
  legal?: {
    standard: boolean       // was string "Legal" | "Banned"
    expanded: boolean
  }
  set: {
    id: string
    name: string
    logo?: string
    symbol?: string
    cardCount: {
      official: number
      total: number
    }
  }
  image?: string            // base URL — append /low.webp or /high.webp
  variants?: {
    holo: boolean
    reverse: boolean
    normal: boolean
    firstEdition: boolean
  }
  pricing?: {
    tcgplayer?: {
      unit: string
      holofoil?: {
        marketPrice?: number | null
        lowPrice?: number | null
        midPrice?: number | null
        highPrice?: number | null
        directLowPrice?: number | null
      }
      normal?: {
        marketPrice?: number | null
        lowPrice?: number | null
        midPrice?: number | null
        highPrice?: number | null
        directLowPrice?: number | null
      }
      reverseHolofoil?: {
        marketPrice?: number | null
      }
    }
    cardmarket?: {
      unit: string
      avg?: number | null
      low?: number | null
      trend?: number | null
    }
  }
  updated?: string          // ISO 8601 timestamp
}

interface TcgDexSetBrief {
  id: string
  name: string
  logo?: string
  symbol?: string
  cardCount: {
    official: number
    total: number
  }
}

interface TcgDexSetDetail {
  id: string
  name: string
  releaseDate?: string
  legal?: {
    standard: boolean
    expanded: boolean
  }
  cards: Array<{
    id: string
    localId: string
    name: string
    image?: string
  }>
}
```

**Step 2: Run typecheck — expect errors (we'll fix them in later tasks)**

```bash
cd customer-backend && npm run typecheck 2>&1 | head -50
```

Expected: multiple errors referencing old field names. That's correct — we'll fix them task by task.

---

## Task 2: Update constructor

**Files:**
- Modify: `customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts`

**Step 1: Replace the class fields and constructor**

```typescript
export class PokemonTransformer {
  private readonly client: AxiosInstance
  private readonly queue: PQueue

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.tcgdex.net/v2/en',
      timeout: 30000,
    })

    // Polite concurrency: 5 parallel card fetches, 100ms interval
    this.queue = new PQueue({ concurrency: 5, interval: 100, intervalCap: 5 })

    logger.info('Pokemon TCG: using TCGdex API (free, no key required)')
  }
```

Remove: `private readonly rateLimit`, `private readonly apiKey`, all API key logging.

**Step 2: Run typecheck**

```bash
cd customer-backend && npm run typecheck 2>&1 | grep "PokemonTransformer" | head -20
```

---

## Task 3: Implement set-fetching helpers

**Files:**
- Modify: `customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts`

Add three private methods **above** `transformToUniversal`. These replace the old `buildQuery` method (delete it).

**Step 1: Add `fetchAllSets`**

```typescript
private async fetchAllSets(releasedInMonth?: string): Promise<TcgDexSetBrief[]> {
  const params: Record<string, string> = { 'pagination:itemsPerPage': '200' }
  if (releasedInMonth) {
    params['releaseDate'] = `like:${releasedInMonth}` // e.g. "like:2026-02"
  }

  const response = await this.fetchWithRetry(
    () => this.client.get<TcgDexSetBrief[]>('/sets', { params }),
    'sets list'
  )
  return response.data
}
```

**Step 2: Add `fetchSetDetail`**

```typescript
private async fetchSetDetail(setId: string): Promise<TcgDexSetDetail> {
  const response = await this.fetchWithRetry(
    () => this.client.get<TcgDexSetDetail>(`/sets/${setId}`),
    `set ${setId}`
  )
  return response.data
}
```

**Step 3: Add `fetchCardById`**

```typescript
private async fetchCardById(cardId: string): Promise<TcgDexCard> {
  const response = await this.fetchWithRetry(
    () => this.client.get<TcgDexCard>(`/cards/${cardId}`),
    `card ${cardId}`
  )
  return response.data
}
```

**Step 4: Update `fetchWithRetry` signature** — it now wraps axios responses, not raw arrays. Replace:

```typescript
private async fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  context: string,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (error) {
      lastError = error as Error
      const status = (error as any)?.response?.status
      const isRetryable =
        !status ||
        status >= 500 ||
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ENOTFOUND')
      if (!isRetryable || attempt === maxRetries) throw error
      const backoffMs = attempt * 5000
      logger.warn(`TCGdex ${context} failed (attempt ${attempt}/${maxRetries}), retrying in ${backoffMs}ms`, {
        error: lastError.message,
        status,
      })
      await this.sleep(backoffMs)
    }
  }
  throw lastError
}
```

---

## Task 4: Rewrite `fetchCards`

**Files:**
- Modify: `customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts`

Replace the entire `fetchCards` method body with a set-based orchestrator.

**Step 1: Write the new `fetchCards`**

```typescript
async fetchCards(game: Game, jobType: ETLJobType, limit?: number): Promise<UniversalCard[]> {
  logger.info('Starting Pokemon TCG data fetch via TCGdex', { gameCode: game.code, jobType, limit })

  try {
    // Determine set filter for incremental jobs
    const releasedInMonth = this.isIncrementalJob(jobType)
      ? this.currentMonthFilter()
      : undefined

    if (releasedInMonth) {
      logger.info(`📅 Incremental mode: fetching sets released in ${releasedInMonth}`)
    }

    // Step 1: Get all (or filtered) set IDs
    const sets = await this.fetchAllSets(releasedInMonth)
    logger.info(`Found ${sets.length} sets to process`)

    if (sets.length === 0) {
      logger.info('No sets to process, returning empty result')
      return []
    }

    // Step 2: For each set, get the card ID list
    const allCardIds: string[] = []
    for (const set of sets) {
      const detail = await this.fetchSetDetail(set.id)
      const cardIds = detail.cards.map(c => c.id)
      allCardIds.push(...cardIds)

      if (limit && allCardIds.length >= limit) break
      await this.sleep(200) // polite delay between set fetches
    }

    const targetIds = limit ? allCardIds.slice(0, limit) : allCardIds
    logger.info(`Fetching ${targetIds.length} individual cards via TCGdex`)

    // Step 3: Fetch full card data concurrently via p-queue
    const cards: TcgDexCard[] = []
    let fetched = 0

    await Promise.all(
      targetIds.map(cardId =>
        this.queue.add(async () => {
          try {
            const card = await this.fetchCardById(cardId)
            cards.push(card)
            fetched++
            if (fetched % 100 === 0) {
              logger.info(`Progress: ${fetched}/${targetIds.length} cards fetched`)
            }
          } catch (error) {
            logger.warn(`Skipping card ${cardId}: ${(error as Error).message}`)
          }
        })
      )
    )

    logger.info('Completed Pokemon TCG data fetch via TCGdex', {
      gameCode: game.code,
      totalCards: cards.length,
      targetLimit: limit || 'unlimited',
    })

    return this.transformToUniversal(cards)
  } catch (error) {
    logger.error('Failed to fetch Pokemon TCG data via TCGdex', error as Error, {
      gameCode: game.code,
      jobType,
      limit,
    })
    throw error
  }
}

private isIncrementalJob(jobType: ETLJobType): boolean {
  return (
    jobType === ETLJobType.INCREMENTAL ||
    jobType === ETLJobType.INCREMENTAL_SYNC
  )
}

private currentMonthFilter(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${mm}` // e.g. "2026-02"
}
```

**Step 2: Delete the old `buildQuery` method entirely** — it's replaced by `fetchAllSets(releasedInMonth?)`.

**Step 3: Run typecheck**

```bash
cd customer-backend && npm run typecheck 2>&1 | grep -v "node_modules" | head -40
```

---

## Task 5: Update `transformToUniversal` and `transformPrint`

**Files:**
- Modify: `customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts`

Update all field references from pokemontcg.io names to TCGdex names.

**Step 1: Update `transformToUniversal`**

The method signature changes from `PokemonCard[]` to `TcgDexCard[]`. Update:

- `card.supertype` → `card.category`
- `card.subtypes || []` → `card.stage ? [card.stage] : []`
- `card.supertypes: [card.supertype]` → `card.supertypes: [card.category]`
- `card.hp ? parseInt(card.hp, 10) : undefined` → `card.hp` (already a number)
- `card.convertedRetreatCost` → `card.retreat`
- `card.evolvesFrom` → `card.evolveFrom` (in `determineEvolutionStage` call and `extractKeywords` call)

Full updated method signature line:
```typescript
private transformToUniversal(pokemonCards: TcgDexCard[]): UniversalCard[] {
```

Full updated `universalCard` object fields that change:
```typescript
primaryType: this.mapSupertype(canonicalCard.category),
subtypes: canonicalCard.stage ? [canonicalCard.stage] : [],
supertypes: [canonicalCard.category],
hp: canonicalCard.hp,                          // number already
retreatCost: canonicalCard.retreat,
evolutionStage: this.determineEvolutionStage(canonicalCard) || undefined,
```

**Step 2: Update `transformPrint`**

Signature: `private transformPrint(pokemonCard: TcgDexCard): UniversalPrint`

Updated fields:
```typescript
setCode: pokemonCard.set.id.toUpperCase(),       // no ptcgoCode in TCGdex
collectorNumber: pokemonCard.localId,            // was number
rarity: this.normalizeRarity(pokemonCard.rarity),
artist: pokemonCard.illustrator,                 // was artist
isFoilAvailable: this.hasFoilVariant(pokemonCard),
isAlternateArt: this.isAlternateArt(pokemonCard),
isPromo: pokemonCard.set.id.toLowerCase().includes('promo'),
flavorText: undefined,                           // TCGdex doesn't have flavorText

externalIds: {
  pokemonTcg: pokemonCard.id,
},                                               // no tcgplayer URL in TCGdex

images: pokemonCard.image ? {
  small: `${pokemonCard.image}/low.webp`,
  normal: `${pokemonCard.image}/high.webp`,
  large: `${pokemonCard.image}/high.webp`,
} : undefined,

prices: this.extractPrices(pokemonCard),
formatLegality: this.extractFormatLegality(pokemonCard),
```

**Step 3: Run typecheck**

```bash
cd customer-backend && npm run typecheck 2>&1 | grep -v "node_modules" | head -40
```

---

## Task 6: Update all helper methods

**Files:**
- Modify: `customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts`

**Step 1: Update `mapSupertype`**

TCGdex uses "Pokemon" (no accent). Keep "Pokémon" mapping too for safety:
```typescript
private mapSupertype(category: string): string {
  const typeMap: Record<string, string> = {
    'Pokémon': 'Creature',
    'Pokemon': 'Creature',
    'Trainer': 'Sorcery',
    'Energy': 'Land',
  }
  return typeMap[category] || category
}
```

**Step 2: Update `buildOracleText`** — change param type and field names:

```typescript
private buildOracleText(card: TcgDexCard): string | undefined {
```

- `card.hp` is already a number — change `if (card.hp)` check stays the same
- `ability.text` → `ability.effect`
- `attack.text` → `attack.effect`
- `attack.damage` is now a number — `if (attack.damage)` still works, display as `${attack.damage}`
- `card.retreatCost` → `card.retreat` — change:
  ```typescript
  if (card.retreat) {
    battleStats.push(`Retreat: ${card.retreat}`)
  }
  ```
  (remove the old array join — `retreat` is now a single number)

**Step 3: Update `extractKeywords`**

```typescript
private extractKeywords(card: TcgDexCard): string[] {
  const keywords: string[] = []
  if (card.evolveFrom) keywords.push('Evolution')      // was evolvesFrom
  if (card.category === 'Trainer') keywords.push('Trainer')   // was supertype
  if (card.category === 'Energy') keywords.push('Energy')
  if (card.types) keywords.push(...card.types)
  return keywords
}
```

**Step 4: Update `determineEvolutionStage`**

```typescript
private determineEvolutionStage(card: TcgDexCard): string | null {
  // TCGdex provides stage directly
  if (card.stage) return card.stage   // "Basic", "Stage1", "Stage2", "VSTAR", etc.
  if (card.category === 'Pokemon') return 'Basic'
  return null
}
```

**Step 5: Update `hasFoilVariant`**

```typescript
private hasFoilVariant(card: TcgDexCard): boolean {
  return card.variants?.holo === true || card.variants?.reverse === true
}
```

**Step 6: Update `isAlternateArt`**

```typescript
private isAlternateArt(card: TcgDexCard): boolean {
  return card.rarity?.toLowerCase().includes('alt art') ||
    card.name?.toLowerCase().includes('alt art')
}
```

**Step 7: Update `extractPrices`**

```typescript
private extractPrices(card: TcgDexCard): { usd?: number } | undefined {
  const tcp = card.pricing?.tcgplayer
  if (!tcp) return undefined

  const usdPrice =
    tcp.holofoil?.marketPrice ??
    tcp.normal?.marketPrice ??
    tcp.reverseHolofoil?.marketPrice ??
    undefined

  return usdPrice != null ? { usd: usdPrice } : undefined
}
```

**Step 8: Update `extractFormatLegality`**

TCGdex uses booleans, not strings:
```typescript
private extractFormatLegality(card: TcgDexCard): Record<string, string> | undefined {
  if (!card.legal) return undefined
  const legality: Record<string, string> = {}
  if (card.legal.standard !== undefined) {
    legality.standard = card.legal.standard ? 'Legal' : 'Banned'
  }
  if (card.legal.expanded !== undefined) {
    legality.expanded = card.legal.expanded ? 'Legal' : 'Banned'
  }
  return Object.keys(legality).length > 0 ? legality : undefined
}
```

**Step 9: Run typecheck — should be clean**

```bash
cd customer-backend && npm run typecheck 2>&1
```

Expected: no errors.

---

## Task 7: Update tests

**Files:**
- Modify: `customer-backend/src/tests/etl/transformers/PokemonTransformer.test.ts`

The tests currently mock `client.get` to return paginated card arrays. With the new 3-tier fetch, a `fetchCards` call triggers:
1. `GET /sets` → returns `TcgDexSetBrief[]`
2. `GET /sets/{id}` → returns `TcgDexSetDetail`
3. `GET /cards/{id}` → returns `TcgDexCard`

**Strategy:** Mock `client.get` using `mockImplementation` that inspects the URL and returns the appropriate fixture.

**Step 1: Replace the entire test file**

```typescript
import axios from 'axios'
import { PokemonTransformer } from '@sidedecked/tcg-catalog/transformers/PokemonTransformer'
import { ETLJobType } from '@sidedecked/tcg-catalog/entities/ETLJob'
import { Game } from '../../../entities/Game'

const mockGet = jest.fn()

jest.mock('axios', () => ({
  create: jest.fn(() => ({ get: mockGet })),
}))

jest.mock('p-queue', () => {
  return jest.fn().mockImplementation(() => ({
    add: (fn: () => Promise<any>) => fn(),
  }))
})

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_SET_BRIEF = { id: 'base1', name: 'Base Set', cardCount: { official: 102, total: 102 } }

function makeSetDetail(cardIds: string[]): any {
  return {
    id: 'base1',
    name: 'Base Set',
    releaseDate: '1999-01-09',
    cards: cardIds.map(id => ({ id, localId: id.split('-')[1], name: 'Card' })),
  }
}

function makeTcgDexCard(overrides: Record<string, any> = {}): any {
  return {
    id: 'base1-4',
    category: 'Pokemon',
    name: 'Charizard',
    localId: '4',
    hp: 120,
    types: ['Fire'],
    evolveFrom: 'Charmeleon',
    stage: 'Stage2',
    illustrator: 'Mitsuhiro Arita',
    rarity: 'Rare',
    attacks: [
      {
        name: 'Fire Spin',
        cost: ['Fire', 'Fire', 'Fire', 'Fire'],
        damage: 100,
        effect: 'Discard 2 Energy cards attached to Charizard in order to use this attack.',
      },
    ],
    weaknesses: [{ type: 'Water', value: 'x2' }],
    resistances: [{ type: 'Fighting', value: '-30' }],
    retreat: 3,
    legal: { standard: false, expanded: false },
    set: { id: 'base1', name: 'Base Set', cardCount: { official: 102, total: 102 } },
    variants: { holo: true, reverse: false, normal: false, firstEdition: true },
    image: 'https://assets.tcgdex.net/en/base/base1/4',
    ...overrides,
  }
}

function makeTrainerCard(overrides: Record<string, any> = {}): any {
  return {
    id: 'base1-77',
    category: 'Trainer',
    name: 'Professor Oak',
    localId: '77',
    illustrator: 'Ken Sugimori',
    rarity: 'Uncommon',
    legal: { standard: false, expanded: false },
    set: { id: 'base1', name: 'Base Set', cardCount: { official: 102, total: 102 } },
    variants: { holo: false, reverse: false, normal: true, firstEdition: true },
    image: 'https://assets.tcgdex.net/en/base/base1/77',
    ...overrides,
  }
}

function makeEnergyCard(overrides: Record<string, any> = {}): any {
  return {
    id: 'base1-98',
    category: 'Energy',
    name: 'Fire Energy',
    localId: '98',
    rarity: 'Common',
    stage: 'Basic',
    legal: { standard: true, expanded: true },
    set: { id: 'base1', name: 'Base Set', cardCount: { official: 102, total: 102 } },
    variants: { holo: false, reverse: false, normal: true, firstEdition: true },
    image: 'https://assets.tcgdex.net/en/base/base1/98',
    ...overrides,
  }
}

function makeGame(): Game {
  return { code: 'POKEMON', name: 'Pokémon TCG' } as Game
}

/**
 * Sets up mockGet to respond correctly to the 3-tier TCGdex fetch:
 *   GET /sets               → [BASE_SET_BRIEF]
 *   GET /sets/base1         → makeSetDetail(cardIds)
 *   GET /cards/{id}         → cardMap[id]
 */
function setupMocks(cards: any[]): void {
  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]))
  const cardIds = cards.map(c => c.id)

  mockGet.mockImplementation((url: string) => {
    if (url === '/sets') {
      return Promise.resolve({ data: [BASE_SET_BRIEF] })
    }
    if (url === '/sets/base1') {
      return Promise.resolve({ data: makeSetDetail(cardIds) })
    }
    const cardId = url.replace('/cards/', '')
    if (cardMap[cardId]) {
      return Promise.resolve({ data: cardMap[cardId] })
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`))
  })
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('PokemonTransformer', () => {
  let transformer: PokemonTransformer

  beforeEach(() => {
    mockGet.mockReset()
    transformer = new PokemonTransformer()
  })

  describe('transformToUniversal — card fields (via fetchCards)', () => {
    it('returns a UniversalCard with correct name', async () => {
      setupMocks([makeTcgDexCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Charizard')
    })

    it('sets normalizedName to lowercase', async () => {
      setupMocks([makeTcgDexCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].normalizedName).toBe('charizard')
    })

    it('maps Pokemon category to primaryType "Creature"', async () => {
      setupMocks([makeTcgDexCard({ category: 'Pokemon' })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].primaryType).toBe('Creature')
    })

    it('maps Trainer category to primaryType "Sorcery"', async () => {
      setupMocks([makeTrainerCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].primaryType).toBe('Sorcery')
    })

    it('maps Energy category to primaryType "Land"', async () => {
      setupMocks([makeEnergyCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].primaryType).toBe('Land')
    })

    it('uses hp directly (already a number)', async () => {
      setupMocks([makeTcgDexCard({ hp: 120 })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].hp).toBe(120)
    })

    it('sets hp to undefined when missing', async () => {
      setupMocks([makeTrainerCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].hp).toBeUndefined()
    })

    it('sets retreatCost from retreat number', async () => {
      setupMocks([makeTcgDexCard({ retreat: 3 })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].retreatCost).toBe(3)
    })

    it('sets energyTypes from types array', async () => {
      setupMocks([makeTcgDexCard({ types: ['Fire'] })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].energyTypes).toEqual(['Fire'])
    })

    it('sets evolutionStage directly from stage field', async () => {
      setupMocks([makeTcgDexCard({ stage: 'Stage2' })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].evolutionStage).toBe('Stage2')
    })

    it('sets evolutionStage to "Basic" for unevolved Pokemon with no stage', async () => {
      setupMocks([makeTcgDexCard({ stage: undefined, evolveFrom: undefined })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].evolutionStage).toBe('Basic')
    })

    it('leaves MTG-specific fields undefined', async () => {
      setupMocks([makeTcgDexCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].manaCost).toBeUndefined()
      expect(result[0].manaValue).toBeUndefined()
      expect(result[0].powerValue).toBeUndefined()
      expect(result[0].defenseValue).toBeUndefined()
    })

    it('groups multiple prints of the same card under one UniversalCard', async () => {
      const print1 = makeTcgDexCard({ id: 'base1-4' })
      const print2 = makeTcgDexCard({ id: 'cel25-5', set: { id: 'cel25', name: 'Celebrations', cardCount: { official: 25, total: 25 } } })
      setupMocks([print1, print2])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 2)
      expect(result).toHaveLength(1)
      expect(result[0].prints).toHaveLength(2)
    })

    it('produces separate UniversalCards for different cards', async () => {
      setupMocks([makeTcgDexCard(), makeTrainerCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 2)
      expect(result).toHaveLength(2)
    })
  })

  describe('transformPrint — print fields (via fetchCards)', () => {
    it('sets setCode from set.id uppercased', async () => {
      setupMocks([makeTcgDexCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].setCode).toBe('BASE1')
    })

    it('sets collectorNumber from localId', async () => {
      setupMocks([makeTcgDexCard({ localId: '4' })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].collectorNumber).toBe('4')
    })

    it('sets language to "en"', async () => {
      setupMocks([makeTcgDexCard()])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].language).toBe('en')
    })

    it('normalizes "Rare" rarity', async () => {
      setupMocks([makeTcgDexCard({ rarity: 'Rare' })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].rarity).toBe('Rare')
    })

    it('normalizes "Promo" rarity to "Special"', async () => {
      setupMocks([makeTcgDexCard({ rarity: 'Promo' })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].rarity).toBe('Special')
    })

    it('sets isFoilAvailable true when variants.holo is true', async () => {
      setupMocks([makeTcgDexCard({ variants: { holo: true, reverse: false, normal: false, firstEdition: false } })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].isFoilAvailable).toBe(true)
    })

    it('sets isFoilAvailable false when no holo/reverse variant', async () => {
      setupMocks([makeTcgDexCard({ variants: { holo: false, reverse: false, normal: true, firstEdition: false } })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].isFoilAvailable).toBe(false)
    })

    it('sets isPromo true when set id contains "promo"', async () => {
      const card = makeTcgDexCard({ set: { id: 'swshp-promo', name: 'SWSH Promo', cardCount: { official: 1, total: 1 } } })
      setupMocks([card])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].isPromo).toBe(true)
    })

    it('sets externalIds.pokemonTcg to card id', async () => {
      setupMocks([makeTcgDexCard({ id: 'base1-4' })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].externalIds!.pokemonTcg).toBe('base1-4')
    })

    it('builds image URLs from TCGdex base image URL', async () => {
      setupMocks([makeTcgDexCard({ image: 'https://assets.tcgdex.net/en/base/base1/4' })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      const images = result[0].prints[0].images!
      expect(images.small).toBe('https://assets.tcgdex.net/en/base/base1/4/low.webp')
      expect(images.normal).toBe('https://assets.tcgdex.net/en/base/base1/4/high.webp')
      expect(images.large).toBe('https://assets.tcgdex.net/en/base/base1/4/high.webp')
    })

    it('returns undefined images when card has no image', async () => {
      setupMocks([makeTcgDexCard({ image: undefined })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].images).toBeUndefined()
    })

    it('extracts format legality from boolean legal fields', async () => {
      setupMocks([makeTcgDexCard({ legal: { standard: true, expanded: false } })])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      const legality = result[0].prints[0].formatLegality!
      expect(legality.standard).toBe('Legal')
      expect(legality.expanded).toBe('Banned')
    })

    it('extracts holofoil market price as USD', async () => {
      const card = makeTcgDexCard({
        pricing: {
          tcgplayer: {
            unit: 'USD',
            holofoil: { marketPrice: 350.0, lowPrice: 300.0, midPrice: 320.0, highPrice: 400.0, directLowPrice: null },
          },
        },
      })
      setupMocks([card])
      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      expect(result[0].prints[0].prices).toEqual({ usd: 350.0 })
    })
  })

  describe('error handling', () => {
    it('skips a card that fails to fetch and continues', async () => {
      const goodCard = makeTcgDexCard({ id: 'base1-4' })
      const cardMap: Record<string, any> = { 'base1-4': goodCard }

      mockGet.mockImplementation((url: string) => {
        if (url === '/sets') return Promise.resolve({ data: [BASE_SET_BRIEF] })
        if (url === '/sets/base1') return Promise.resolve({ data: makeSetDetail(['base1-4', 'base1-99']) })
        if (url === '/cards/base1-4') return Promise.resolve({ data: goodCard })
        if (url === '/cards/base1-99') return Promise.reject(new Error('Not Found'))
        return Promise.reject(new Error(`Unexpected: ${url}`))
      })

      const result = await transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 2)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Charizard')
    })

    it('throws when sets list fetch fails', async () => {
      mockGet.mockRejectedValue(new Error('Network Error'))
      await expect(
        transformer.fetchCards(makeGame(), ETLJobType.FULL_SYNC, 1)
      ).rejects.toThrow('Network Error')
    })
  })
})
```

**Step 2: Run tests — verify they all pass**

```bash
cd customer-backend && npm test -- --testPathPattern="PokemonTransformer" --no-coverage 2>&1 | tail -20
```

Expected: all tests pass.

**Step 3: Run typecheck**

```bash
cd customer-backend && npm run typecheck 2>&1
```

Expected: no errors.

---

## Task 8: Final verification

**Step 1: Full quality gate**

```bash
cd customer-backend && npm run lint && npm run typecheck && npm run build && npm test -- --no-coverage 2>&1 | tail -30
```

Expected: 0 lint errors, 0 type errors, build succeeds, all tests pass.

**Step 2: Commit**

```bash
git add customer-backend/packages/tcg-catalog/src/transformers/PokemonTransformer.ts \
        customer-backend/src/tests/etl/transformers/PokemonTransformer.test.ts
git commit -m "feat(etl): migrate Pokemon ETL from pokemontcg.io to TCGdex API"
```
