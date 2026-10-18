/**
 * Spawns the built server (build/index.js) as a real stdio child process and
 * talks to it with the official MCP SDK client, the same way Claude Desktop,
 * Claude Code or VS Code would.
 */

import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const SERVER_PATH = fileURLToPath(new URL("../build/index.js", import.meta.url));

export interface ToolResult<T = any> {
  isError: boolean;
  data: T;
}

export interface SelfHubClient {
  client: Client;
  call<T = any>(name: string, args?: Record<string, unknown>): Promise<ToolResult<T>>;
  close(): Promise<void>;
}

export async function connectSelfHub(mongoUri: string, clientName = "selfhub-test"): Promise<SelfHubClient> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_PATH],
    env: { ...process.env, MONGODB_URI: mongoUri } as Record<string, string>,
    stderr: "pipe",
  });
  const client = new Client({ name: clientName, version: "0.0.0" });
  await client.connect(transport);

  return {
    client,
    async call(name, args) {
      // Omit `arguments` entirely when none are given, as some clients do
      const result = await client.callTool(args === undefined ? { name } : { name, arguments: args });
      const content = result.content as Array<{ type: string; text?: string }>;
      return { isError: Boolean(result.isError), data: JSON.parse(content[0]?.text ?? "null") };
    },
    close: () => client.close(),
  };
}
