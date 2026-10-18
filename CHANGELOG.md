# Changelog

## [0.3.0] - 2026-10-18

- Add an end-to-end test suite (`pnpm test`, 14 tests): each test spawns `build/index.js`, connects with the MCP SDK client and runs against `mongodb-memory-server`. CI runs it on every push and PR. Against v0.2.5, 7 of the 14 fail
- Add `pnpm demo`: three separate server processes (Claude Desktop, Claude Code, VS Code) share one in-memory MongoDB; what one stores, the others recall
- Add a `Dockerfile` and `docker-compose.yml` (MongoDB 8 plus the server), with a CI job that builds the image and checks the `initialize` reply over stdio
- Prepare npm and MCP Registry publishing: `bin`, `files`, `mcpName` and `engines` in `package.json`, `server.json`, and a tag-triggered `release.yml` that publishes with npm trusted publishing and GitHub OIDC
- Fix the first `search_memories` call on a new database failing with "text index required for $text query": indexes are now built before the server accepts calls
- Fix `search_memories` filters (category, type, tags) running on the top 100 text hits instead of inside the query, which could drop matching memories; results now carry the MongoDB `textScore` as `score`
- Fix `delete_memory` leaving the deleted ID in every context, which inflated `memoryCount`
- Fix `create_context` storing memory IDs that do not exist
- `list_memories` sorts, skips and limits in MongoDB instead of loading every match into Node
- `activate_context` loads a context's memories with one `$in` query instead of one query and one write per memory, and no longer counts the bulk load as an access
- Exit cleanly when the client closes stdin instead of idling on the open MongoDB connection

## [0.2.5] - 2026-10-18

- Fix `get_stats`, `list_memories` and `list_contexts` failing with "Arguments are required" when the client omits `arguments`
- Fix `search_memories` ignoring the `type` filter and `create_context` ignoring `memoryIds`: both were documented but never reached the services
- Fix `activate_context` with an unknown ID deactivating the currently active context
- Report the real package version in the MCP `serverInfo` handshake instead of a hard-coded 0.1.0
- Fix `pnpm clean` (and `pnpm reset`), which called `rimraf` without it being installed
- Move pnpm overrides from `package.json` to `pnpm-workspace.yaml`: pnpm 12 ignores the `pnpm` field, so since 0.2.4 the lockfile had fallen back to vulnerable `ip-address` 10.1.0 (1 high, 4 moderate advisories); now 10.7.4, `pnpm audit` is clean
- Bump `@modelcontextprotocol/sdk` to 1.32.1 (GHSA-6qxp-vccf-f47h, high), mongoose 9.11.2, dotenv 18.0.8, @types/node 26.6.5, tsx 4.23.15
- CI: least-privilege `permissions: contents: read`, install with `--ignore-scripts`, and a `pnpm audit --audit-level=high` step, because GitHub's dependency graph only reads the first YAML document of the pnpm 12 lockfile and no longer sees app dependencies
- README: architecture diagram, design decisions, Claude Code setup

## [0.2.4] - 2026-10-11

- Monthly major update: Node 24, pnpm 12, TypeScript 7, dotenv 18, @hono/node-server 2, actions/checkout and setup-node v7, pnpm/action-setup v6
- pnpm 12 refuses to run unapproved dependency build scripts (`ERR_PNPM_IGNORED_BUILDS`), so `pnpm-workspace.yaml` now approves esbuild's install script with `allowBuilds`
- dotenv 18 with `quiet: true` still writes nothing to stdout, so the MCP stdio channel stays clean

## [0.2.3] - 2026-10-06

- Keep stdout clean for the MCP stdio transport: load dotenv with `quiet: true` (dotenv 17 logs an injection banner to stdout) and send the MongoDB connect/close log lines to stderr

## [0.2.2] - 2026-09-03

- Add pnpm override for qs >=6.16.0 to resolve array-limit bypass advisory (Dependabot alert #42)

## [0.2.1] - 2026-09-02

- Bump mongoose to 9.9.4 and add pnpm overrides for hono, @hono/node-server, fast-uri, ip-address, body-parser to resolve Dependabot security alerts

## [0.2.0] - 2026-03-14

- Fix .env.example to use placeholder credentials

## [0.1.0] - 2025-11-27

- Implement MongoDB integration for persistent storage
- Memory and Context schemas with full-text search indexes
- 9 MCP tools: store/retrieve/list/search/delete memory, create/activate/list contexts, get stats

## [0.0.2] - 2025-11-09

- Enhance README with features and setup instructions
- Add GitHub Actions workflows and funding options

## [0.0.1] - 2025-11-09

- Initialize SelfHub MCP server with TypeScript
- Memory and context management tools via stdio transport
- pnpm workspace setup
