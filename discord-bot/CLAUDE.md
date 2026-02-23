# Discord Bot — discord.js 14

> Also read the root `../CLAUDE.md` for global rules.

## Code Style

- **TypeScript:** ESM (`"type": "module"` in package.json)
- **Dev runner:** `tsx watch` for hot reload
- **Build:** `tsc` to `dist/`

## Patterns

- discord.js 14.16.0 — slash commands, event handlers
- Express 4.21.0 for webhook endpoints
- Rate limiting via `express-rate-limit`
- GitHub integration via `@octokit/rest`

## Testing

- **Runner:** Vitest 2.0.0
- **Coverage:** v8 provider, >80% required

## Quality Gate

```bash
npm run lint && npm run build && npm test
```

## Key Dependencies

discord.js 14.16.0 | Express 4.21.0 | TypeScript 5.5.0 | Vitest 2.0.0
