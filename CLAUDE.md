# CLAUDE.md

> This file stacks on top of the workspace root at `C:\Code\GitHub\`:
> - Root [`CLAUDE.md`](../../CLAUDE.md) -- voice, rules, routing map, references, skills, slash commands, conventions.
> - Root [`MEMORY.md`](../../MEMORY.md) -- live facts across repos.
> - Root [`STATUS.md`](../../STATUS.md) -- live PR/CI/security dashboard.
> - [`.claude/resources/`](../../.claude/resources/README.md) -- deep reference for collaboration, workflow, git, OSS, debugging, voice.
>
> Read those first. The guidance below only adds **repo-specific context** -- it does not override anything in the root.

## Project

SelfHub is a personal MCP (Model Context Protocol) server -- a cross-assistant memory hub that stores notes, preferences, snippets, and tasks in MongoDB and exposes them as 9 MCP tools to any MCP client (Claude Desktop, VS Code Copilot).

Public repo at github.com/Sagargupta16/SelfHub. Runs locally as a stdio process launched by the client; nothing is deployed.

## Stack

- **Language**: TypeScript 5, ESM
- **Framework**: `@modelcontextprotocol/sdk` (stdio transport)
- **Database**: MongoDB via Mongoose 9
- **Package manager**: pnpm
- **Deploy target**: local-only

## Run

```
pnpm install
pnpm dev          # tsx watch src/index.ts (auto-reload)
pnpm build        # tsc -> build/
pnpm seed         # load 6 sample memories + 2 contexts
```

## Test

No test suite. `pnpm typecheck` (tsc --noEmit) is the only check. No CI workflows either -- `.github/` holds only CODEOWNERS and FUNDING.yml; Renovate handles deps.

## Entry points

- `src/index.ts` -- the MCP server: all 9 tool definitions and request handlers
- `src/seed.ts` -- sample data seeder (`pnpm seed`)

## Key files

- `src/services/memory.service.ts`, `src/services/context.service.ts` -- business logic
- `src/storage/mongodb-storage.ts` -- persistence layer
- `src/db/schemas.ts` + `src/db/connection.ts` -- Mongoose schemas and connection
- `src/models/` -- TypeScript interfaces (memory, context)

## Gotchas

- Server speaks MCP over **stdio** -- you cannot poke it with curl or run it interactively. Verify via an MCP client, or check the startup log line (`Connected to MongoDB`, 9 tools listed).
- `MONGODB_URI` comes from `.env`; if unset it silently falls back to `mongodb://localhost:27017/selfhub`. A real `.env` exists locally -- never commit or read it.
- `prepare` script runs `pnpm build` on every `pnpm install`.
- Windows client configs need double backslashes in the `build/index.js` path.
- Version drift: `package.json` says 0.1.0 while the README describes v0.2.0. Reconcile when touching either.
- `.nvmrc` pins Node 19 (non-LTS, stale) -- modern Node works fine; bump the pin when touching tooling.

## Install

- `pnpm install && pnpm build` -- output at `build/index.js`

## Usage

- Register in the MCP client: `node C:\\abs\\path\\to\\SelfHub\\build\\index.js` in `claude_desktop_config.json` (Claude Desktop) or `.vscode/mcp.json` (VS Code).
- Tools: `store_memory`, `retrieve_memory`, `list_memories`, `search_memories`, `delete_memory`, `create_context`, `activate_context`, `list_contexts`, `get_stats`.

## Config

- Config file: `.env` (copy from `.env.example`)
- Vars: `MONGODB_URI` (names only, never values)
