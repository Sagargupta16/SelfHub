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

- **Language**: TypeScript 7, ESM, Node 24 (`.nvmrc`)
- **Framework**: `@modelcontextprotocol/sdk` (stdio transport)
- **Database**: MongoDB via Mongoose 9
- **Package manager**: pnpm 12 (overrides and `allowBuilds` live in `pnpm-workspace.yaml`; pnpm 12 ignores the `pnpm` field in `package.json`)
- **Deploy target**: local-only (stdio). Distribution: npm `selfhub-mcp-server`, MCP Registry `io.github.Sagargupta16/selfhub`, and a local Docker Compose image

## Run

```
pnpm install
pnpm dev          # tsx watch src/index.ts (auto-reload)
pnpm build        # tsc -> build/
pnpm seed         # load 6 sample memories + 2 contexts
pnpm test         # build + end-to-end tests
pnpm demo         # cross-client demo on an in-memory MongoDB
docker compose run --rm -T selfhub   # server + MongoDB in containers
```

## Test

`pnpm test` builds, then runs `test/server.test.ts` with `tsx --test`: each test spawns `build/index.js` through the MCP SDK `StdioClientTransport` against `mongodb-memory-server` (mongod downloads on first run; `allowBuilds` sets its postinstall to `false`). `pnpm demo` runs `scripts/demo.ts`, which reuses `test/harness.ts`. `pnpm typecheck` also checks `test/` and `scripts/` through `test/tsconfig.json`.

`.github/workflows/ci.yml` runs install (`--ignore-scripts`), `pnpm audit --audit-level=high`, `pnpm typecheck`, `pnpm build` and `pnpm test` on push and PR to main, plus a `docker` job that builds the compose image and pipes an MCP `initialize` into it. CodeQL runs as GitHub default setup. Renovate handles deps.

`.github/workflows/release.yml` runs on a `v*` tag: version check (tag = `package.json` = `server.json`), gates, `npm publish` via trusted publishing, then `mcp-publisher login github-oidc` and `publish`. Bump `package.json`, both versions in `server.json`, and the README roadmap heading together.

GitHub's dependency graph only reads the first YAML document of the pnpm 12 lockfile (the pnpm binaries), so Dependabot does not see app dependencies. The CI audit step is the real vulnerability gate.

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
- The MCP `serverInfo.version` is read from `package.json` at startup; bump the version there and in the README roadmap heading together.

## Install

- `pnpm install && pnpm build` -- output at `build/index.js`

## Usage

- Register in the MCP client: `node C:\\abs\\path\\to\\SelfHub\\build\\index.js` in `claude_desktop_config.json` (Claude Desktop) or `.vscode/mcp.json` (VS Code).
- Tools: `store_memory`, `retrieve_memory`, `list_memories`, `search_memories`, `delete_memory`, `create_context`, `activate_context`, `list_contexts`, `get_stats`.

## Config

- Config file: `.env` (copy from `.env.example`)
- Vars: `MONGODB_URI` (names only, never values)
