#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { memoryService } from "./services/memory.service.js";
import { contextService } from "./services/context.service.js";

/**
 * SelfHub MCP Server
 * Your personal AI memory hub with mock data storage
 */

// Define available tools
const TOOLS: Tool[] = [
  // Memory Management Tools
  {
    name: "store_memory",
    description: "Store a new piece of information in your memory hub",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to store",
        },
        type: {
          type: "string",
          enum: ["short-term", "long-term", "contextual"],
          description: "Type of memory (default: long-term)",
        },
        category: {
          type: "string",
          enum: ["personal", "professional", "learning", "projects", "conversations", "documents", "code", "tasks", "contacts", "timeline", "custom"],
          description: "Category of the memory",
        },
        title: {
          type: "string",
          description: "Optional title for the memory",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for categorization",
        },
        importance: {
          type: "number",
          minimum: 1,
          maximum: 5,
          description: "Importance level (1-5)",
        },
        contextId: {
          type: "string",
          description: "Optional context ID to associate with",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "retrieve_memory",
    description: "Retrieve a specific memory by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Memory ID to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_memories",
    description: "List memories with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["short-term", "long-term", "contextual"],
          description: "Filter by memory type",
        },
        category: {
          type: "string",
          description: "Filter by category",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter by tags",
        },
        contextId: {
          type: "string",
          description: "Filter by context ID",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 50)",
        },
        offset: {
          type: "number",
          description: "Offset for pagination (default: 0)",
        },
      },
    },
  },
  {
    name: "search_memories",
    description: "Search memories using text query",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
        category: {
          type: "string",
          description: "Filter by category",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter by tags",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 10)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "delete_memory",
    description: "Delete a memory by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Memory ID to delete",
        },
      },
      required: ["id"],
    },
  },
  // Context Management Tools
  {
    name: "create_context",
    description: "Create a new context for organizing memories",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Context name",
        },
        type: {
          type: "string",
          enum: ["project", "conversation", "topic", "temporal"],
          description: "Type of context",
        },
        description: {
          type: "string",
          description: "Optional description",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for the context",
        },
      },
      required: ["name", "type"],
    },
  },
  {
    name: "activate_context",
    description: "Activate a context and load its memories",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Context ID to activate",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_contexts",
    description: "List all contexts with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["project", "conversation", "topic", "temporal"],
          description: "Filter by context type",
        },
        active: {
          type: "boolean",
          description: "Filter by active status",
        },
      },
    },
  },
  // Analytics Tools
  {
    name: "get_stats",
    description: "Get usage statistics about your memory hub",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: "selfhub-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error("Arguments are required");
    }

    switch (name) {
      case "store_memory": {
        const memory = await memoryService.storeMemory({
          content: args.content as string,
          type: args.type as any,
          category: args.category as any,
          metadata: {
            title: args.title as string | undefined,
            tags: (args.tags as string[]) || [],
            importance: ((args.importance as number) || 3) as 1 | 2 | 3 | 4 | 5,
          },
          contextId: args.contextId as string | undefined,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "Memory stored successfully",
                  memory: {
                    id: memory.id,
                    type: memory.type,
                    category: memory.category,
                    title: memory.metadata.title,
                    tags: memory.metadata.tags,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "retrieve_memory": {
        const memory = await memoryService.retrieveMemory(args.id as string);
        if (!memory) {
          throw new Error(`Memory not found: ${args.id}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(memory, null, 2),
            },
          ],
        };
      }

      case "list_memories": {
        const result = await memoryService.listMemories({
          type: args.type as any,
          category: args.category as any,
          tags: args.tags as string[],
          contextId: args.contextId as string,
          limit: args.limit as number,
          offset: args.offset as number,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  memories: result.memories.map((m) => ({
                    id: m.id,
                    type: m.type,
                    category: m.category,
                    title: m.metadata.title,
                    content: m.content.substring(0, 100) + (m.content.length > 100 ? "..." : ""),
                    tags: m.metadata.tags,
                    importance: m.metadata.importance,
                    createdAt: m.metadata.createdAt,
                  })),
                  total: result.total,
                  showing: result.memories.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_memories": {
        const result = await memoryService.searchMemories({
          query: args.query as string,
          category: args.category as any,
          tags: args.tags as string[],
          limit: args.limit as number,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  results: result.results.map((r) => ({
                    id: r.memory.id,
                    title: r.memory.metadata.title,
                    content: r.memory.content.substring(0, 150) + (r.memory.content.length > 150 ? "..." : ""),
                    relevance: r.relevance,
                    tags: r.memory.metadata.tags,
                    category: r.memory.category,
                  })),
                  total: result.total,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "delete_memory": {
        const success = await memoryService.deleteMemory(args.id as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success,
                message: success ? "Memory deleted successfully" : "Memory not found",
              }),
            },
          ],
        };
      }

      case "create_context": {
        const context = await contextService.createContext({
          name: args.name as string,
          type: args.type as any,
          description: args.description as string,
          tags: args.tags as string[],
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "Context created successfully",
                  context: {
                    id: context.id,
                    name: context.name,
                    type: context.type,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "activate_context": {
        const context = await contextService.activateContext(args.id as string);
        if (!context) {
          throw new Error(`Context not found: ${args.id}`);
        }

        const memories = await contextService.getContextMemories(context.id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "Context activated",
                  context: {
                    id: context.id,
                    name: context.name,
                    type: context.type,
                    memoryCount: memories.length,
                  },
                  memories: memories.map((m) => ({
                    id: m.id,
                    title: m.metadata.title,
                    content: m.content.substring(0, 100) + "...",
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_contexts": {
        const contexts = await contextService.listContexts({
          type: args.type as any,
          active: args.active as boolean,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  contexts: contexts.map((c) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    description: c.description,
                    active: c.metadata.active,
                    memoryCount: c.memoryIds.length,
                    tags: c.metadata.tags,
                  })),
                  total: contexts.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_stats": {
        const stats = await memoryService.getStats();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: true,
              message: errorMessage,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 SelfHub MCP Server running with mock data!");
  console.error("📊 Loaded 6 sample memories and 2 sample contexts");
  console.error("🛠️  Available tools: 9 (store, retrieve, search, list, delete, contexts, stats)");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
