# Discord Bot Instructions for GPT Codex

## Scope

Applies to `discord-bot/` only. Also follow root `../AGENTS.md`.

## Core Constraints

- Use the existing TypeScript ESM setup (`"type": "module"`).
- Keep command and event handler patterns aligned with `discord.js` v14 usage in this repo.
- Prefer existing bot and webhook architecture over new abstractions.

## Code and Structure

- Keep build output in `dist/` via existing TypeScript build config.
- Reuse current Express webhook and rate-limiting patterns.
- Keep integrations (for example GitHub) within existing client wrappers.

## Testing and Quality Gate

- Add/update Vitest tests for behavior changes.
- Run:
  - `npm run lint && npm run build && npm test`

