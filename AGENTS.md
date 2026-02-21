# SideDecked — Project Context

TCG marketplace (MTG, Pokemon, Yu-Gi-Oh!, One Piece). Split-brain architecture.

## Services

| Service | Path | Stack | Database |
|---|---|---|---|
| Commerce backend | `repos/backend/` | MedusaJS v2 | mercur-db |
| Customer backend | `repos/customer-backend/` | Node.js + TypeORM | sidedecked-db |
| Storefront | `repos/storefront/` | Next.js 14 | — |
| Vendor panel | `repos/vendorpanel/` | React 18 + Vite | — |
| Discord bot | `discord-bot/` | Node.js + discord.js | — |

## Critical Rule

mercur-db and sidedecked-db are never directly connected. Cross-database communication is API-only.

## Quality Gate

Per service: `npm run lint && npm run typecheck && npm run build && npm test`

## Commits

Format: `type(scope): description` — conventional commits, present tense, no period.
Never add AI references, TODO comments, or robot emojis.
