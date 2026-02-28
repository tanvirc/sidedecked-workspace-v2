# Design Thinking Session: SideDecked Storefront Homepage

**Date:** 2026-02-28
**Facilitator:** Tav
**Design Challenge:** Redesign the SideDecked storefront homepage from the ground up to deliver an authentic, trust-building first impression that converts new TCG visitors into active community members and buyers — while feeling unmistakably different from commodity card marketplaces.

---

## 🎯 Design Challenge

The SideDecked homepage serves visitors who arrive without a specific card in mind — browsers evaluating the platform, returning users reorienting after absence, and sellers assessing whether to list here. High-intent buyers bypass it via search. The redesign must deliver *three distinct experiences from one URL*: (1) prove marketplace credibility to an anonymous visitor within 10 seconds; (2) return an authenticated user to their context within 3 taps; (3) convert a seller-evaluator into a listing intent. Visual beauty is a multiplier, not the cause — the cause is *time-to-first-value*. Community signals matter only once marketplace trust is established. The homepage's true job is not to impress — it is to *eliminate the delay between arrival and meaningful action*.

**Four homepage modes (one URL):**
1. **Anonymous visitor** — prove the marketplace is real, capable, and trustworthy in < 10 seconds; credibility proof is segment-specific: casual collectors need visual trust signals (real photos, real reviews), while TCG-native players need real prices and real availability numbers
2. **Authenticated returning user** — get them back to their context (deck, watchlist, recent cards) in < 3 taps; this is the *primary* mode for experienced TCG players, most of whom will first encounter SideDecked via a deep-linked card page, not the homepage
3. **Seller evaluator** — surface evidence of platform health and seller success *above the fold* with a dedicated entry point (hero-level CTA or section), not buried in scroll; signals needed: active seller count, avg time-to-sale, fee structure, real testimonials
4. **Orientation-first newcomer** — TCG-newcomers who don't yet know what a secondary card market is need a single orienting statement before any credibility proof: *"Buy and sell MTG, Pokémon, Yu-Gi-Oh! and One Piece singles from verified sellers"* — orientation precedes trust

**Plus one conversion path that cuts across all modes:**
- **Community-to-commerce loop** — community browsers (deck sharers, discussion readers, meta-watchers) who discover a card they want while browsing non-commerce content; this serendipitous path is high-value because engaged community members convert at higher rates; the homepage must enable accidental discovery, not just explicit purchase intent

**Credibility proof is not universal — it's mode-specific:**
- Casual collector: professional appearance, real card photos, readable reviews
- TCG-native player: real prices with context, real stock counts, real seller transaction history
- Seller evaluator: platform health metrics, seller success evidence, transparent fee structure
- Newcomer: clear category orientation, no jargon above the fold

**Time-to-first-value targets:**
- Anonymous browser: first interesting card in < 10 seconds
- Returning user: back to deck/watchlist in < 3 taps
- Seller evaluator: evidence of seller success visible without scrolling
- Newcomer: understands what the site does in < 5 seconds

**User segments served (ranked by homepage landing probability):**
1. Low-intent browser / platform evaluator — no specific card in mind
2. Returning authenticated player — resuming context (arrives via homepage bookmark/direct)
3. TCG-newcomer — needs orientation before evaluation
4. Seller evaluator — assessing SideDecked as a listing channel
5. Community member — browsing for discussion, decks, meta content (serendipitous commerce path)
6. High-intent buyer — likely arrived via search deep-link, not homepage

**Constraints:**
- Next.js 15 storefront, 200+ existing atomic components
- Four games (MTG, Pokémon, Yu-Gi-Oh!, One Piece), extensible
- Split-brain architecture — BFF endpoints for aggregated data
- Touch-first, CSS-first — mobile is primary
- No mock/placeholder data in production

---

## 👥 EMPATHIZE: Understanding Users

### User Insights

**Methods used:** Empathy Mapping (synthesised from existing research) · Journey Mapping · User Interviews (synthesised — no primary data collected)

**Mode 1 — Anonymous Visitor / Platform Evaluator**
Arrives cautious and ready to bounce. Scans for familiar trust signals in the first 3–5 seconds. Tests the site by searching for a specific card — if the price feels fake or the result is absent, they leave. The emotional gap: the homepage looks designed but doesn't feel *operational*. No single element proves "real transactions happen here."

**Mode 2 — Authenticated Returning User**
The most purposeful visitor. Knows exactly what they want — their deck, watchlist, or a price alert. The homepage is an obstacle; the nav bar is their only escape hatch. Every return visit feels like a first visit because there is no personalised layer. The homepage was not designed for them despite them being the highest-value segment.

**Mode 3 — Seller Evaluator**
Analytical, time-conscious, unconvinced until shown hard numbers. Arrived with a specific question: "Is this worth setting up?" The homepage answers that question with buyer-facing content and silence on seller outcomes. If the first scroll contains nothing seller-specific, they leave and don't return — seller acquisition is a one-shot opportunity.

**Mode 4 — TCG Newcomer**
Curious but fragile. Needs one plain-English sentence before anything else: what is this site? TCG jargon (NM, LP, listings, singles) creates immediate confusion. Disproportionately sensitive to anything that feels professional vs. anything that feels like insider knowledge required.

**Cross-cutting — Community-to-Commerce Browser**
Arrives for non-purchase reasons (deck browsing, meta discussion, community activity). Highest serendipitous conversion potential because they're engaged and trust the platform socially. Currently underserved — community content feels like a widget rather than a destination.

### Key Observations

1. **Not a single mode wants to be impressed — every mode wants to accomplish a task.** The visual ambition of the current homepage serves no user's primary motivation. Beauty is a multiplier on task-completion, not a goal in itself.

2. **Two modes share the same session state (anonymous) but need opposite first signals.** Mode 1 (evaluator) needs trust proof. Mode 4 (newcomer) needs orientation. A single hero cannot serve both without a brief adaptive layer.

3. **Returning users are invisible.** The entire current homepage is designed for strangers. The highest-value segment — authenticated returning players — gets zero personalised surface. They navigate away from the homepage within 2 seconds on every visit.

4. **Seller evaluators have no dedicated entry point.** The /sell page exists. The homepage does not direct evaluators to it. Seller acquisition is being abandoned at the first touchpoint.

5. **The "fake community" problem hits Mode 4 hardest.** Newcomers rely on social proof most heavily — it's their primary trust signal when they lack TCG market experience. Placeholder avatars and hardcoded activity destroy the one signal that would convert them.

6. **Mobile is the primary device for 4 of 5 modes.** Only seller evaluators (mode 3) are likely on desktop. Every homepage design decision must pass the mobile-first test before anything else.

7. **The journey *before* the homepage visit defines what the user needs on arrival.** Mode 1 arrived from Google (wants validation). Mode 2 arrived from a bookmark (wants context restoration). Mode 3 arrived searching "sell cards on SideDecked" (wants seller evidence). Mode 4 arrived from YouTube (wants orientation). The homepage cannot ignore these arrival contexts.

8. **Time-to-first-value is the real metric — not time-on-page.** A newcomer who finds their card in 8 seconds and leaves for the card detail page is a success. A visitor who spends 45 seconds scrolling a beautiful homepage and bounces is a failure.

### Empathy Map Summary

| Mode | Says | Thinks | Does | Feels |
|---|---|---|---|---|
| **Anonymous visitor** | "Is this legit? Are these prices real?" | "I've been burned before. Is this eBay?" | Scans for trust signals, tests search with a known card | Cautious, hopeful, ready to bounce |
| **Returning user** | "Let me check my deck / watchlist / price alert" | "Why do I have to scroll past all this every time?" | Navigates away from homepage in < 2 seconds | Purposeful, mildly impatient |
| **Seller evaluator** | "How many sellers? What are the fees? How fast do cards sell?" | "This homepage is talking to buyers, not me" | Scans for seller content, finds buyer-facing page, leaves | Analytical, skeptical, unconvinced |
| **Newcomer** | "What is this site? What's NM? Can I just buy a card?" | "I don't know where to start. Is this eBay for cards?" | Reads headline, encounters jargon, searches for a card they know | Curious, easily overwhelmed, jargon-sensitive |
| **Community browser** | "What's trending? Any good decks to check out?" | "I might buy something if I see something I want" | Browses community content, stumbles into commerce | Relaxed, exploratory, open to serendipity |

**Synthesised voice from existing research:**
- *"Finally — a place that gets TCG players"* — the emotion a first visit should produce, currently blocked by fabricated community signals
- *"Is this real?"* — the dominant negative micro-emotion; triggered by mock data, placeholder avatars, hardcoded market intelligence
- *"I can't do this on my phone"* — extends beyond the deck builder to the homepage itself: complex layouts, small targets, hover-dependent elements
- *"The Alex at the LGS test"* — between rounds, mobile, needs to act in under 2 minutes. The homepage must not slow him down even when he accidentally lands there.

---

## 🎨 DEFINE: Frame the Problem

### Point of View Statement

**Mode 1 — Anonymous Visitor**
A cautious first-time visitor **needs to see evidence of real transactions within 10 seconds** because visual polish cannot overcome marketplace skepticism — only proof of operational reality can.

**Mode 2 — Returning Authenticated User**
A returning TCG player **needs their platform context immediately restored on arrival** because the homepage was built for strangers, and every return visit that starts from zero wastes the relationship the platform has already earned.

**Mode 3 — Seller Evaluator**
A prospective seller **needs compelling marketplace health evidence above the fold** because seller acquisition is a one-shot window — a homepage that speaks only to buyers silently rejects every seller who arrives.

**Mode 4 — TCG Newcomer**
A new TCG player **needs plain-English orientation before any marketplace content** because jargon-first design treats newcomer curiosity as a burden rather than the acquisition opportunity it is.

**Mode 5 — Community Browser**
An engaged community member **needs frictionless serendipitous pathways from content to commerce** because their existing trust makes them high-converting buyers — but only if the path from "interesting card" to "add to cart" has no friction tax.

### How Might We Questions

**On trust and credibility:**
1. How might we show an anonymous visitor that real people are successfully buying here — before they have to search for it?
2. How might we make real pricing data feel more credible than polished placeholder data at a glance?
3. How might we surface seller track records as a trust signal without cluttering the buyer experience?

**On personalisation and context:**
4. How might we restore a returning user's context the moment they land — without requiring them to navigate?
5. How might we personalise the homepage for authenticated users without making anonymous visitors feel like second-class citizens?
6. How might we make the homepage feel like it "remembers" a returning user, even without a complex recommendation engine?

**On serving multiple modes:**
7. How might we serve four radically different user modes from one URL without the page feeling fragmented or compromised?
8. How might we signal seller opportunity above the fold without diluting the buyer-first experience?
9. How might we orient a TCG newcomer without alienating an experienced player reading the same headline?
10. How might we detect or infer user mode (buyer / seller / newcomer / returner) without requiring a login?

**On time-to-first-value:**
11. How might we reduce the time between homepage arrival and first meaningful action to under 10 seconds for every mode?
12. How might we make the search bar the true hero of the page — the escape hatch for every mode?
13. How might we make a community browser stumble into a purchase they didn't know they wanted?

**On mobile:**
14. How might we design a homepage that works perfectly with one thumb, in a noisy game shop, on a 5-inch screen?
15. How might we make the four-game selector feel like a natural gesture on mobile rather than a desktop widget ported down?

### Key Insights

**Insight 1: The homepage has an identity crisis — and that's the opportunity.**
It's currently designed as a single experience for an undefined visitor. It should be two-to-three experiences that share chrome but diverge immediately based on auth state and surfaced intent. The technology already exists (Next.js 15 server components, auth detection). The design pattern doesn't yet exist in SideDecked.

**Insight 2: The real competitive differentiation is the feeling of being known.**
TCGPlayer has better inventory. Scryfall has better data. Moxfield has better deck tools. SideDecked's opening is the *integrated* experience — the platform that remembers your deck, alerts you to your price drops, and routes you from community to cart without friction. The homepage must *demonstrate* this integration, not describe it.

**Insight 3: Seller acquisition is being silently abandoned at the homepage.**
No competitor homepage speaks clearly to seller evaluators. This is an uncontested surface. A seller who arrives and immediately sees their opportunity becomes a listing — and every listing improves the buyer experience. The flywheel starts here.

**Insight 4: Community is a trust multiplier, not a trust foundation.**
Community features should appear *after* marketplace credibility is established — not as the first trust signal. Real transaction counts, verified seller badges, and live price data build primary trust. Community pulse amplifies it for visitors already considering staying.

**Insight 5: The search bar is the unsung hero of every mode.**
Every mode eventually needs search. It should not be tucked in the header — for a card marketplace, it may deserve to be the primary interactive element above the fold, surfacing autocomplete suggestions of trending or recently-viewed cards as an immediate engagement hook.

**Opportunity areas:**
- **Authenticated personalisation layer** — transforms the homepage from stranger-facing to context-restoring for returning users; highest-ROI single change
- **Seller signal in the hero** — a single line or CTA acknowledging sellers exist; zero cost to buyers, high value to seller evaluators
- **Real-data trust strip** — a compact bar of live operational metrics (X cards listed · X sellers · X transactions this week) that proves the marketplace is alive
- **Newcomer orientation sentence** — one plain-English sub-headline that explains the platform in zero jargon
- **Community-to-commerce card** — a content card showing a trending card with live price and one-tap "view listings" — the serendipitous purchase trigger

---

## 💡 IDEATE: Generate Solutions

### Selected Methods

1. **Brainstorming** — full team, one opportunity area at a time, no judgment, quantity first
2. **Crazy 8s** — 8 layout concepts for homepage structure, one sentence each
3. **SCAMPER Design** — seven lenses applied to the existing homepage structure (GamesBentoGrid · CommunityPulse · CollectionShowcase · MarketIntelligence · HomeProductSection)

### Generated Ideas

**Opportunity 1 — Authenticated Personalisation Layer**
1. Hero swaps to "Welcome back" bar on login: last viewed card / deck progress / price alerts — three tiles, one glance
2. "Your Homepage" tab toggle — flip between discovery view and personal dashboard without leaving `/`
3. Search bar placeholder personalises: anonymous = "Search MTG, Pokémon, Yu-Gi-Oh!, One Piece cards" · authenticated = "Search cards, or jump back to [last deck name]"
4. "Since you were last here" summary module: "2 price alerts triggered · Charizard dropped $4.20 · Your deck is 3 cards from complete"
5. Game filter invisible for returning users — homepage pre-filtered to their game with subtle "Switch game" link
6. Returning users never see the game selector — it remembers and applies silently
7. "Your Price Wins" micro-section — watched cards that dropped since last visit, framed as wins
8. Cookie-based soft personalisation for anonymous repeat visitors — pre-filters game after 2 visits

**Opportunity 2 — Seller Signal in the Hero**
9. Hero sub-headline: "Buy from 800+ verified sellers · [Become a seller →]" — buyers see trust count, sellers see CTA
10. "Sellers made $X this month" live counter — real backend number, updated daily
11. "Selling?" inline expander in hero — reveals: avg time-to-first-sale · avg monthly earnings · active seller count
12. Seller spotlight card — one featured seller per day: name, game specialty, transaction count, "See listings" CTA
13. Seller spotlight gamified: "Top seller this week: 47 sales" — creates aspiration + trust simultaneously
14. Persistent "Start selling" FAB for non-authenticated users — gentle, non-intrusive invitation

**Opportunity 3 — Real-Data Trust Strip**
15. Live marketplace heartbeat strip: "12,847 cards listed · 340 verified sellers · 3 sold in the last hour"
16. Game-specific trust strips — each game tile shows its own live stat: "MTG: 4,200 listings · lowest NM fetchland: $12.40"
17. All strip data from single Redis-cached endpoint, 30-second TTL — zero performance impact
18. Competitive claim strip: "Prices 12% lower than TCGPlayer on average this week" — backed by real price comparison
19. Interactive trust strip — tap any stat to see a 7-day sparkline proving the data is real and trending

**Opportunity 4 — Newcomer Orientation**
20. Two-line hero sub-headline: "The marketplace for MTG, Pokémon, Yu-Gi-Oh! and One Piece singles. Buy individual cards from verified sellers — no booster packs required."
21. "New to card singles?" expandable inline tooltip — gentle explanation, no modal, no page nav
22. "New here?" smart banner — first-time visitors only (cookie), disappears after first search
23. Condition education in context — "Near Mint (NM) — like new condition" on first display, not in a tutorial

**Opportunity 5 — Community-to-Commerce**
24. "Trending in the community" section — top 3 discussed/searched cards, live price, "View listings" CTA
25. Community-to-commerce card with context: "Trending because: new format ban · see 4 decks using this card"
26. "Deck of the day" module — community deck + estimated buy price + "12 cards available on SideDecked"
27. "Format alert" banner for authenticated users — "2 cards in your deck banned · Find replacements →"
28. "Recently sold" live ticker — not just count but *which* cards: "Charizard Base Set LP · $28 · just sold"

**Crazy 8s — Layout Concepts**
C1. Search-only above fold — giant search bar, game pills below, nothing else until scroll
C2. Bifurcated hero — left: "Find your card", right: "List your collection"
C3. Living card hero — one full-width trending card, giant art, real price, real stock
C4. Game-gate first — full-screen game selector on first visit, customises everything below
C5. Dashboard hero for authenticated — personal strip (deck/alerts/watchlist) above discovery content
C6. Metric-led hero — trust strip as the hero element, search below
C7. Community-first layout — trending/community at top, commerce below
C8. Progressive reveal — minimal on load, builds as user scrolls

**SCAMPER on Existing Structure**
- Substitute: GamesBentoGrid static tiles → live game market snapshot with trending card + price
- Combine: CommunityPulse + CollectionShowcase → single "Trending" section
- Adapt: Moxfield "deck of the day" → homepage featured deck with buy price
- Modify: HomeProductSection → "today's best deals" (value-hunt framing)
- Put to other use: MarketIntelligence → seller acquisition signal ("see what's selling")
- Eliminate: CollectionShowcase as standalone — replace with contextual trending cards
- Reverse: Page order — community/social proof first, commerce CTAs last

### Top Concepts

**Concept 1 — "The Bifurcated Alive Hero" (B + A-static)**
A hero that speaks to buyers and sellers simultaneously. Left/primary: buyer trust with launch-resilient metrics (catalog size, seller count, games supported — not transaction velocity). Right/secondary: seller opportunity signal with inline stats expander. Search bar prominent within the hero, not isolated above it. Trust strip below hero shows A-static data at launch, graduates to A-live when transaction volume supports it.

*Why resilient at launch:* "800+ cards listed · 40 verified sellers · 4 games" is credible from day one. "3 sold this hour" requires volume. Same design system, swappable data sources.

**Concept 2 — "The Context-Restoring Homepage" (C)**
An authenticated server component layer that transforms the hero for returning users. A compact three-tile strip replaces the hero CTAs: deck progress ("Modern deck — 47/60 cards · 3 missing") + triggered price alerts ("Fetchland dropped $3.20") + watchlist hits ("2 new listings for cards you're watching"). Each tile is tappable, navigates directly to context. On mobile: collapses to most urgent tile with "see all" overflow. Anonymous users see Concept 1 unchanged.

*Architecture:* Single BFF endpoint aggregating deck + price alert + watchlist services, cached per session, rendered as Next.js 15 server component inside a Suspense boundary — no flash of wrong content, no client-side flicker.

**Concept 3 — "The Serendipity Layer" (D — supporting section, shared by both states)**
A below-fold section serving browsers who don't have search intent yet. Three components:
- "Trending now" — top 3 community-surfaced cards with live prices and "View listings" CTA
- "Deck of the day" — featured community deck with estimated build cost and available card count
- "Format alert" (authenticated only) — ban list / rotation changes affecting the user's decks

*Placement:* Below the hero in both anonymous and authenticated states. Community-to-commerce path without requiring the user to have arrived with purchase intent.

**Composed architecture (all three concepts):**
```
Anonymous user:         Authenticated user:
─────────────────       ─────────────────────────────────
[Concept 1 Hero]        [Concept 2 — Personalised Strip]
[Trust Strip A-static]  [Concept 1 Hero — below strip]
[Game Grid]             [Trust Strip A-static]
[Concept 3 — Serendipity Layer]   [Game Grid]
[Seller Signal]         [Concept 3 — Serendipity Layer]
[Footer]                [Seller Signal]
                        [Footer]
```

**User alignment on Concept 2 personalised strip content:** All three tiles (deck progress + price alerts + watchlist hits) in a compact scannable strip — the "LGS that remembers you" moment.

---

## 🛠️ PROTOTYPE: Make Ideas Tangible

### Prototype Approach

**Methods selected:**
1. Storyboarding — user journey through each homepage mode (before/during/after)
2. Paper Prototyping — annotated lo-fi wireframes, mobile-first (390px baseline)
3. Wizard of Oz — fake the complex parts (authenticated layer, live data, trending cards) to test assumptions before building

**What we are trying to learn (riskiest assumptions first):**
1. Does a returning user immediately understand and use the three-tile personalised strip without explanation? (Concept 2)
2. Does the plain-English orientation sentence work for newcomers without alienating experienced players? (Newcomer variant)
3. Does the A-static trust strip ("8,400 cards · 340 sellers") feel credible at launch without transaction velocity? (Concept 1)
4. Is the seller CTA visible enough below the trust strip for a seller evaluator? (Concept 1)
5. Does a browser without purchase intent tap a trending card? (Concept 3 serendipity layer)

**What to fake vs. build:**

| Element | Fake (Wizard of Oz) | Build |
|---|---|---|
| Authenticated personalised strip | Hardcode realistic strip: "Modern deck — 47/60 · Fetchland ↓ $3.20 · 2 new watchlist listings" | Auth detection + Suspense boundary + BFF endpoint |
| A-static trust strip | Static realistic numbers: "8,400 cards · 340 sellers · 4 games" | Redis-cached live endpoint |
| A-live trust strip | Deferred — not in prototype | Redis real-time query (post-launch) |
| Trending cards | Manually curated 3 cards with realistic prices | Algorithmic trending endpoint |
| Seller spotlight | Static example seller with plausible stats | Dynamic daily rotation |
| Game selector memory | Cookie with hardcoded Pokémon pre-selection | Cookie-based preference storage |
| Format alert banner | Static "2 cards banned" banner | Auth + deck analysis + ban list API |

### Prototype Description

**Three homepage states, mobile-first (390px viewport):**

---

**State 1 — Anonymous Homepage (Concept 1 + Serendipity Layer)**

Layout from top:
1. Sticky nav: Logo · Browse · Decks · Sell · Cart
2. HERO: H1 orientation sentence ("The marketplace for MTG, Pokémon, Yu-Gi-Oh! and One Piece singles. Buy individual cards from verified sellers — no booster packs required.")
3. Search bar — largest interactive element above fold, communicates priority by size
4. Game pills: [MTG] [Pokémon] [YGO] [OP] — secondary to search, for browsers without card name
5. A-static trust strip: "📦 8,400 cards · 👥 340 verified sellers · ✅ Buyers protected"
6. Seller signal (single line): "Become a seller →"
7. TRENDING NOW section: 3 trending cards with real art, real price, real stock, "View →" CTA
8. DECK OF THE DAY: community deck name · format · estimated build price · "Buy missing cards →"
9. BROWSE BY GAME: 2×2 bento grid, each tile shows game name + live listing count
10. Footer

---

**State 2 — Authenticated Homepage (Concept 2 + Concept 1 + Serendipity Layer)**

Layout from top:
1. Sticky nav with notification bell + cart badge
2. PERSONALISED STRIP: "👋 Welcome back, Tav" header + 3 equal tiles:
   - Tile 1: 🃏 [Deck name] · 47/60 · [View →]
   - Tile 2: 🔔 [Card name] ↓ $3.20 · [View →]
   - Tile 3: 👁 2 new listings · [View →]
   - Mobile compact fallback: collapses to highest-priority tile + "···" overflow
3. Search bar (below strip, still prominent)
4. Game pills (pre-selected to user's game if known)
5. Trust strip condensed: "8,400 cards · 340 sellers" (1 line — authenticated users past credibility question)
6. FORMAT ALERT (conditional): "⚠️ 2 cards in your deck are now banned · Find replacements →"
7. TRENDING NOW: same serendipity layer as State 1
8. BROWSE BY GAME: same bento grid
9. Footer (seller CTA removed — not relevant for authenticated buyers)

---

**State 3 — First-Time Newcomer Variant (State 1 + newcomer banner)**

State 1 with a dismissible banner prepended above the hero:
"👋 New to card singles? Buy individual cards — no booster packs needed. Start with a search → ✕"
- Cookie-triggered: first visit only
- Dismisses permanently on ✕ or first search action
- Invisible to returning visitors

---

**Suspense boundary behaviour (all authenticated states):**
While personalised strip loads: show trust strip + search bar (the anonymous hero) as fallback. Strip snaps in when data resolves. No blank state, no flash of wrong content.

### Key Features to Test

Ranked by assumption risk:

**P1 — Personalised strip comprehension (highest risk)**
Does a returning user immediately understand the three tiles without label explanation? Do they tap through, or ignore and navigate manually?

**P2 — Orientation sentence for newcomers vs. experienced players**
Does the plain-English H1 sub-headline work for newcomers without being condescending to experienced TCG players who know what singles are?

**P3 — A-static trust strip credibility**
Does "8,400 cards · 340 sellers" feel like a real number or a made-up one? Does it shift a skeptical first-time visitor toward trust?

**P4 — Seller CTA visibility**
Does a seller evaluator notice "Become a seller →" below the trust strip, or does their eye skip it in a buyer-first layout?

**P5 — Serendipity layer engagement**
Does a browser without explicit purchase intent tap a trending card? Or do they scroll past and bounce? Validates whether Concept 3 earns its position.

---

## ✅ TEST: Validate with Users

### Testing Plan

**Prototype format:** Annotated wireframe walkthrough (lo-fi, on device) — three static states with tappable hotspots. No polish intentional — reduces "I don't want to hurt your feelings" bias.

**Target participants:** 5–7 people across all four homepage modes. 20–30 minutes each. Run before any production code is written.

| Participant | Mode | Recruitment |
|---|---|---|
| 1–2 | Anonymous visitor / platform evaluator | TCG player who hasn't used SideDecked |
| 1 | TCG newcomer | Someone new to the secondary card market |
| 1–2 | Returning authenticated user | Prior SideDecked user, or warm walkthrough simulation |
| 1 | Seller evaluator | Sells on TCGPlayer, eBay, or Facebook Marketplace |
| 1 | Community browser | Follows TCG content, occasional buyer |

**Task script:**

- **Task 1 — First impression (all):** Show State 1 for 5 seconds. Cover. "What is this website? What can you do here? Who is it for?" → validates P2 (orientation sentence)
- **Task 2 — Trust evaluation (anonymous + newcomers):** Show State 1 with trust strip. "You're buying here for the first time. How confident do you feel? What would make you more confident?" → validates P3 (A-static credibility)
- **Task 3 — Find a card (all):** "Find a Near Mint Charizard Base Set. Show me what you'd do." → measures time-to-first-value, search bar primacy
- **Task 4 — Returning strip (authenticated):** Show State 2. Wait 10 seconds in silence. "What do you notice first? What would you tap?" → validates P1 (personalised strip comprehension)
- **Task 5 — Seller evaluation (seller evaluator):** "You're thinking of listing your collection here. Spend 30 seconds on this page. What's relevant to that decision?" → validates P4 (seller signal visibility)
- **Task 6 — Serendipitous discovery (community + anonymous):** Show State 1 scrolled to Trending Now. "No specific card in mind — just browsing. What catches your attention?" → validates P5 (serendipity layer engagement)

**Facilitation rules:** Give device. Say prompt. Do not explain. Do not help. Watch. Take notes on what they do, not just what they say.

**What to watch for beyond tasks:**
- Hesitation before search — signals they're looking for something the page isn't providing
- Scroll depth before first action — measures time-to-first-value
- The words they use to describe the site — "TCG marketplace" vs. "card eBay" vs. "deck tool"
- One-handed mobile use — anything that requires two hands is a friction point
- The moment of trust — what were they looking at when they said "okay, I'd buy here"?
- The moment of doubt — what triggered "hmm, I'm not sure about this"?

### User Feedback

*(To be completed after testing sessions)*

**Feedback Capture Grid (per session):**

| ✅ Liked | ❓ Questions raised |
|---|---|
| [Record unprompted positive reactions] | [Record confusion signals and missing information requests] |

| 💡 Ideas suggested | 🔧 Changes needed |
|---|---|
| ["It would be cool if..."] | [Specific friction points and things that felt wrong] |

**Hypothesis tracking (complete after all sessions):**

| Assumption | Validated | Invalidated | Needs more data |
|---|---|---|---|
| P1 — Personalised strip immediately understood | | | |
| P2 — Orientation sentence works for newcomers without alienating experts | | | |
| P3 — A-static trust strip feels credible | | | |
| P4 — Seller CTA visible to seller evaluators | | | |
| P5 — Serendipity layer drives organic engagement | | | |

### Key Learnings

*(To be completed after testing sessions)*

**Synthesis questions to answer:**
1. Which assumptions held across all participants?
2. Which were invalidated — and how severe is the risk?
3. What patterns emerged that weren't anticipated?
4. What single change would most improve all five test scenarios?
5. Are we ready to refine the prototype, or reframe the problem?

**Decision gate:** If P1 (personalised strip) is invalidated → revisit Concept 2 architecture before building. If P3 (A-static trust) is invalidated → accelerate A-live data pipeline or find alternative trust signals. If P4 (seller CTA) is invisible → elevate seller signal to hero level (Crazy 8 C2: bifurcated hero).

---

## 🚀 Next Steps

### Refinements Needed

**R1 — Trust strip copy needs launch-number calibration**
Replace placeholder metrics with actual database numbers before testing. If real numbers are lower than expected, test whether framing compensates: "Growing fast — 800 cards and counting" vs. "800 cards listed."

**R2 — Seller CTA copy is generic**
Test two variants: "Sell your cards →" (action-first) vs. "Turn your collection into cash →" (outcome-first). The second may resonate more with seller evaluators who need to see *why*, not just *how*.

**R3 — Personalised strip tile priority ordering**
Define urgency hierarchy: price alert triggered > new watchlist listings > deck progress. The mobile compact fallback (single tile) must always show the most time-sensitive item. Equal weighting is wrong.

**R4 — Serendipity layer card mobile hierarchy**
Test two trending card layouts: (a) card art dominant with price below, (b) price and stock dominant with art as background. Hierarchy should serve the "I'd click that" moment, not information completeness.

**R5 — Newcomer banner tone validation**
"New to card singles?" risks condescension for users who know singles but are new to SideDecked. Test with both newcomer and experienced participants. Fallback: "First time here? Start with a search →"

**R6 — Community compass section needs its own design pass**
Trending Now and Deck of the Day modules were defined conceptually but not component-designed. Particularly: how "trending because: [reason]" is displayed without becoming a data dump on mobile.

### Action Items

**Phase 1 — Validate before building**
- [ ] A1: Update UX design specification with homepage redesign section using this document as source
- [ ] A2: Build lo-fi HTML wireframe prototype — 3 states (anonymous, authenticated, newcomer) as clickable HTML, fake all dynamic data
- [ ] A3: Run 5–7 user testing sessions using task script from Step 6 — prioritise genuine newcomer (P2), genuine seller evaluator (P4), and 2 returning users (P1)
- [ ] A4: Synthesise feedback into decision document — complete hypothesis tracking table, identify single highest-impact change

**Phase 2 — Refine based on test outcomes**
- [ ] A5: Revise prototype based on test findings — if P1 failed, redesign authenticated strip; if P4 failed, elevate seller signal to hero level
- [ ] A6: Finalise homepage component specification — annotated component list with data sources, API contracts, auth-aware render logic

**Phase 3 — Build**
- [ ] A7: Create homepage redesign epic via `/bmad-bmm-create-epics-and-stories` — suggested stories:
  - Anonymous homepage (Concept 1 + A-static trust strip + serendipity layer)
  - Authenticated personalisation layer (Concept 2 + BFF endpoint)
  - Seller signal + copy A/B test framework
  - Newcomer detection + orientation banner
  - A-static → A-live trust strip graduation (post-launch, conditional on data)
- [ ] A8: Run `/bmad-bmm-create-ux-design` to translate this output into formal UX artefacts before implementation
- [ ] A9: Implement via TDD — quality gate: lint + typecheck + build + test (80% coverage) before every commit

### Success Metrics

**P1 — Personalised strip:** ≥ 70% of authenticated users tap a strip tile within 10 seconds of landing. Baseline: 0% (doesn't exist).

**P2 — Newcomer orientation:** ≥ 80% of first-time visitors complete a search within their first session. Baseline: establish from current analytics pre-launch.

**P3 — Anonymous trust conversion:** ≥ 40% of anonymous homepage visitors navigate to at least one card detail page in the same session. Baseline: establish pre-launch.

**P4 — Seller acquisition signal:** ≥ 5% of unique homepage visitors navigate to `/sell` in the same session. Baseline: near-zero (no seller CTA on current homepage).

**P5 — Serendipity engagement:** ≥ 20% of non-search homepage sessions result in a trending card tap. Baseline: 0% (section doesn't exist).

**Overall:**
- Time-to-first-value (anonymous): ≤ 10 seconds to first card detail page view
- Context restoration (authenticated): ≤ 3 taps from homepage to deck/watchlist/alert
- Bounce rate: establish baseline pre-launch; target ≥ 15% reduction post-launch

**A-static → A-live graduation trigger:** Switch when daily transaction count ≥ 10 AND the live number is consistently credible. Never show a live number that undermines trust.

---

_Generated using BMAD Creative Intelligence Suite - Design Thinking Workflow_
