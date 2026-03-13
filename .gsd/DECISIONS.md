# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | arch | OAuth providers for MVP | Google + Discord | Google for mainstream, Discord for TCG community hub. Apple deferred (needs Developer Program). | Yes — add Apple when Developer Program enrolled |
| D002 | M001 | convention | Design system name | Voltage | Wireframes use "Voltage" naming. CSS tokens already use Voltage naming. PRD's "Midnight Forge" is superseded. | No |
| D003 | M001 | convention | Wireframe authority | HTML files in docs/plans/wireframes/ | HTML wireframes are the authoritative design source. Figma is the export target, not the source of truth. | Yes — if Figma workflow changes |
| D004 | M001 | arch | Cart optimizer approach | Greedy heuristic | Greedy is simplest, sufficient for MVP seller volumes (< 500). Revisit if optimization quality is insufficient at scale. | Yes — if conversion data shows suboptimal results |
| D005 | M001 | scope | Pixel-perfect priority pages | Card browse, card detail, deck builder, deck browser, deck viewer | User explicitly flagged these 5 pages as highest priority for visual fidelity. | No |
| D006 | M001 | convention | Wireframe coverage for generated pages | Happy path + key empty state | Generated wireframes cover primary content state and one empty state per page. Error states and loading states follow Voltage patterns generically. | Yes — if design review requests more states |
| D007 | M001 | arch | Milestone sequence | M001 (MVP) → M002 (Trust) → M003 (Growth) → M004 (Community) → M005 (Intelligence) | Risk-ordered: prove core loop first, then scale supply, then deepen engagement, then add intelligence. | Yes — if market feedback changes priorities |
| D008 | M001/S01 | convention | Price typography via CSS class | `.price` CSS class from globals.css | Single source of truth for tabular figures (`font-feature-settings: 'tnum'`, `font-family: var(--font-mono-stats)`, `color: var(--text-price)`). All PriceTag variants use this class instead of inline styles. | No |
| D009 | M001/S01 | convention | Voltage token application in components | Inline `style` for CSS custom properties | Tailwind doesn't have utility classes for custom Voltage tokens (--text-tertiary, --bg-surface-2, etc.). Components use inline `style={{ color: 'var(--text-tertiary)' }}`. Migrate if Tailwind is extended with Voltage utilities. | Yes — if Tailwind config extends Voltage tokens |
| D010 | M001/S01 | convention | footerLinks export shape | Named exports (navLinks, socialLinks) | Default export with 3 groups replaced by two named exports matching wireframe structure. Only Footer.tsx consumes this module. | No |
