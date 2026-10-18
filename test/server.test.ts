/**
 * End-to-end contract tests: real server process, real MCP client, real
 * MongoDB (mongodb-memory-server). Each test gets its own database so counts
 * stay exact.
 */

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectSelfHub, SelfHubClient, SERVER_PATH } from "./harness.js";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  name: string;
  version: string;
};

const TOOL_NAMES = [
  "store_memory",
  "retrieve_memory",
  "list_memories",
  "search_memories",
  "delete_memory",
  "create_context",
  "activate_context",
  "list_contexts",
  "get_stats",
];

let mongo: MongoMemoryServer;
const open: SelfHubClient[] = [];
let dbCounter = 0;

/** A fresh server process on a fresh database */
async function freshHub(clientName?: string, dbName = `selfhub_test_${++dbCounter}`) {
  const hub = await connectSelfHub(mongo.getUri(dbName), clientName);
  open.push(hub);
  return hub;
}

async function store(hub: SelfHubClient, args: Record<string, unknown>): Promise<string> {
  const r = await hub.call("store_memory", args);
  assert.equal(r.isError, false, JSON.stringify(r.data));
  return r.data.memory.id;
}

before(async () => {
  mongo = await MongoMemoryServer.create();
}, { timeout: 300_000 });

after(async () => {
  await Promise.all(open.map((hub) => hub.close()));
  await mongo.stop();
});

test("handshake reports the package version and lists all 9 tools", async () => {
  const hub = await freshHub();
  assert.deepEqual(hub.client.getServerVersion(), { name: pkg.name, version: pkg.version });

  const { tools } = await hub.client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), [...TOOL_NAMES].sort());
});

test("tools without required params work when the client omits arguments", async () => {
  const hub = await freshHub();
  for (const name of ["get_stats", "list_memories", "list_contexts"]) {
    const r = await hub.call(name);
    assert.equal(r.isError, false, `${name}: ${JSON.stringify(r.data)}`);
  }
});

test("a memory is searchable right after the first write to a new database", async () => {
  const hub = await freshHub();
  await store(hub, { content: "Kubernetes operators reconcile desired state" });

  const r = await hub.call("search_memories", { query: "kubernetes" });
  assert.equal(r.isError, false, JSON.stringify(r.data));
  assert.equal(r.data.total, 1);
  assert.equal(typeof r.data.results[0].score, "number");
});

test("search_memories applies type, category and tag filters", async () => {
  const hub = await freshHub();
  await store(hub, { content: "TypeScript long note", type: "long-term", category: "professional", tags: ["ts"] });
  await store(hub, { content: "TypeScript short note", type: "short-term", category: "learning", tags: ["ts"] });
  await store(hub, { content: "TypeScript code sample", type: "long-term", category: "code", tags: ["snippet"] });

  const byType = await hub.call("search_memories", { query: "typescript", type: "short-term" });
  assert.equal(byType.data.total, 1);
  assert.equal(byType.data.results[0].content, "TypeScript short note");

  const byCategory = await hub.call("search_memories", { query: "typescript", category: "code" });
  assert.equal(byCategory.data.total, 1);

  const byTag = await hub.call("search_memories", { query: "typescript", tags: ["ts"] });
  assert.equal(byTag.data.total, 2);
});

test("search filters run before the result cap, not on the top 100 hits", async () => {
  const hub = await freshHub();
  // 120 short, repetitive hits outscore the one long "code" memory on textScore,
  // so a filter applied after a top-100 cut would never see it
  for (let i = 0; i < 120; i++) {
    await store(hub, { content: `deploy checklist deploy checklist ${i}`, category: "tasks" });
  }
  await store(hub, { content: "deploy checklist notes for the quarterly code freeze review meeting", category: "code" });

  const r = await hub.call("search_memories", { query: "deploy checklist", category: "code" });
  assert.equal(r.data.total, 1);
  assert.equal(r.data.results[0].category, "code");
});

test("list_memories paginates in the database and reports the full total", async () => {
  const hub = await freshHub();
  const ids: string[] = [];
  for (let i = 1; i <= 5; i++) ids.push(await store(hub, { content: `note ${i}` }));

  const r = await hub.call("list_memories", { limit: 2, offset: 1 });
  assert.equal(r.data.total, 5);
  assert.equal(r.data.showing, 2);
  // newest first: offset 1 skips note 5
  assert.deepEqual(r.data.memories.map((m: { id: string }) => m.id), [ids[3], ids[2]]);
});

test("create_context keeps only memory IDs that exist", async () => {
  const hub = await freshHub();
  const id = await store(hub, { content: "Context member" });

  const created = await hub.call("create_context", { name: "Proj", type: "project", memoryIds: [id, "mem_missing"] });
  assert.equal(created.isError, false, JSON.stringify(created.data));

  const list = await hub.call("list_contexts", {});
  assert.equal(list.data.contexts[0].memoryCount, 1);

  const activated = await hub.call("activate_context", { id: created.data.context.id });
  assert.equal(activated.data.context.memoryCount, 1);
  assert.equal(activated.data.memories[0].id, id);
});

test("activate_context with an unknown ID leaves the active context alone", async () => {
  const hub = await freshHub();
  const created = await hub.call("create_context", { name: "Main", type: "project" });
  await hub.call("activate_context", { id: created.data.context.id });

  const missing = await hub.call("activate_context", { id: "ctx_missing" });
  assert.equal(missing.isError, true);

  const list = await hub.call("list_contexts", {});
  assert.equal(list.data.contexts[0].active, true);
});

test("delete_memory also removes the memory from its contexts", async () => {
  const hub = await freshHub();
  const id = await store(hub, { content: "Will be deleted" });
  await hub.call("create_context", { name: "Proj", type: "project", memoryIds: [id] });

  const deleted = await hub.call("delete_memory", { id });
  assert.equal(deleted.data.success, true);

  const list = await hub.call("list_contexts", {});
  assert.equal(list.data.contexts[0].memoryCount, 0);
});

test("loading a context does not count as accessing each memory", async () => {
  const hub = await freshHub();
  const id = await store(hub, { content: "Read only on bulk load" });
  const ctx = await hub.call("create_context", { name: "Proj", type: "project", memoryIds: [id] });
  await hub.call("activate_context", { id: ctx.data.context.id });

  const r = await hub.call("retrieve_memory", { id });
  assert.equal(r.data.metadata.accessCount, 1);
});

test("retrieve_memory with an unknown ID returns a tool error", async () => {
  const hub = await freshHub();
  const r = await hub.call("retrieve_memory", { id: "mem_missing" });
  assert.equal(r.isError, true);
  assert.match(r.data.message, /Memory not found/);
});

test("get_stats counts by type, category and tag", async () => {
  const hub = await freshHub();
  await store(hub, { content: "a", type: "short-term", category: "code", tags: ["x", "y"] });
  await store(hub, { content: "b", category: "code", tags: ["x"] });
  await hub.call("create_context", { name: "Proj", type: "project" });

  const r = await hub.call("get_stats");
  assert.equal(r.data.totalMemories, 2);
  assert.equal(r.data.totalContexts, 1);
  assert.deepEqual(r.data.byType, { "short-term": 1, "long-term": 1 });
  assert.deepEqual(r.data.byCategory, { code: 2 });
  assert.deepEqual(r.data.topTags[0], { tag: "x", count: 2 });
});

test("the server answers, then exits cleanly when the client closes stdin", { timeout: 30_000 }, async () => {
  const child = spawn(process.execPath, [SERVER_PATH], {
    env: { ...process.env, MONGODB_URI: mongo.getUri(`selfhub_test_${++dbCounter}`) },
    stdio: ["pipe", "pipe", "ignore"],
  });
  let stdout = "";
  child.stdout.on("data", (chunk) => (stdout += chunk));

  const initialize = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "raw", version: "0" } },
  };
  child.stdin.end(JSON.stringify(initialize) + "\n");

  const [code] = (await once(child, "exit")) as [number | null];
  assert.equal(code, 0);
  assert.equal(JSON.parse(stdout.trim()).result.serverInfo.version, pkg.version);
});

test("two clients on the same database share memories", async () => {
  const dbName = `selfhub_test_shared_${++dbCounter}`;
  const desktop = await freshHub("claude-desktop", dbName);
  const code = await freshHub("claude-code", dbName);

  await store(desktop, { content: "I prefer pnpm over npm", category: "personal", tags: ["preferences"] });

  const r = await code.call("search_memories", { query: "pnpm" });
  assert.equal(r.data.total, 1);
  assert.equal(r.data.results[0].content, "I prefer pnpm over npm");
});
