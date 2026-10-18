/**
 * Cross-client demo: three separate server processes, one per "client",
 * sharing one throwaway in-memory MongoDB. What one client stores, the next
 * one recalls. Never touches MONGODB_URI or your real data.
 *
 *   pnpm demo
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import { connectSelfHub, SelfHubClient } from "../test/harness.js";

function show(client: string, tool: string, args: Record<string, unknown>, result: string) {
  console.log(`[${client}] ${tool} ${JSON.stringify(args)}`);
  console.log(`  -> ${result}\n`);
}

async function session<T>(mongoUri: string, client: string, fn: (hub: SelfHubClient) => Promise<T>): Promise<T> {
  const hub = await connectSelfHub(mongoUri, client);
  try {
    return await fn(hub);
  } finally {
    await hub.close();
  }
}

const mongo = await MongoMemoryServer.create();
const uri = mongo.getUri("selfhub_demo");

try {
  const contextId = await session(uri, "claude-desktop", async (hub) => {
    const pref = { content: "I use pnpm for every JavaScript project, never npm or yarn", category: "personal", tags: ["preferences", "tooling"], importance: 5 };
    const stored = await hub.call("store_memory", pref);
    show("claude-desktop", "store_memory", pref, `stored ${stored.data.memory.id}`);

    const style = { content: "API responses use camelCase keys and ISO 8601 dates", category: "projects", tags: ["api"] };
    const second = await hub.call("store_memory", style);
    show("claude-desktop", "store_memory", style, `stored ${second.data.memory.id}`);

    const ctxArgs = { name: "Billing API", type: "project", memoryIds: [second.data.memory.id] };
    const ctx = await hub.call("create_context", ctxArgs);
    show("claude-desktop", "create_context", ctxArgs, `created ${ctx.data.context.id}`);
    return ctx.data.context.id as string;
  });

  await session(uri, "claude-code", async (hub) => {
    const args = { query: "pnpm" };
    const found = await hub.call("search_memories", args);
    const top = found.data.results[0];
    show("claude-code", "search_memories", args, `${found.data.total} result: "${top.content}" (score ${top.score}, relevance ${top.relevance})`);
  });

  await session(uri, "vscode-copilot", async (hub) => {
    const args = { id: contextId };
    const active = await hub.call("activate_context", args);
    const titles = active.data.memories.map((m: { content: string }) => `"${m.content.replace(/\.\.\.$/, "")}"`);
    show("vscode-copilot", "activate_context", args, `${active.data.context.name}, ${active.data.context.memoryCount} memory: ${titles.join(", ")}`);

    const stats = await hub.call("get_stats");
    const categories = Object.entries(stats.data.byCategory as Record<string, number>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => `${name} ${count}`);
    show("vscode-copilot", "get_stats", {}, `${stats.data.totalMemories} memories (${categories.join(", ")}), ${stats.data.totalContexts} context`);
  });
} finally {
  await mongo.stop();
}
