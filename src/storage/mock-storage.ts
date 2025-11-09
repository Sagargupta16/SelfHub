/**
 * Mock in-memory storage for testing and development
 */

import { Memory, Context } from "../models/index.js";

export class MockStorage {
  private memories: Map<string, Memory> = new Map();
  private contexts: Map<string, Context> = new Map();

  constructor() {
    this.seedMockData();
  }

  // Memory operations
  async createMemory(memory: Memory): Promise<Memory> {
    this.memories.set(memory.id, memory);
    return memory;
  }

  async getMemory(id: string): Promise<Memory | undefined> {
    const memory = this.memories.get(id);
    if (memory) {
      // Update access count
      memory.metadata.accessCount++;
      memory.metadata.lastAccessedAt = new Date();
    }
    return memory;
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | undefined> {
    const memory = this.memories.get(id);
    if (!memory) return undefined;

    const updated = {
      ...memory,
      ...updates,
      metadata: {
        ...memory.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      },
    };

    this.memories.set(id, updated);
    return updated;
  }

  async deleteMemory(id: string): Promise<boolean> {
    return this.memories.delete(id);
  }

  async listMemories(filter?: {
    type?: string;
    category?: string;
    tags?: string[];
    contextId?: string;
  }): Promise<Memory[]> {
    let results = Array.from(this.memories.values());

    if (filter?.type) {
      results = results.filter((m) => m.type === filter.type);
    }
    if (filter?.category) {
      results = results.filter((m) => m.category === filter.category);
    }
    if (filter?.tags && filter.tags.length > 0) {
      results = results.filter((m) =>
        filter.tags!.some((tag) => m.metadata.tags.includes(tag))
      );
    }
    if (filter?.contextId) {
      results = results.filter((m) => m.relations?.contextId === filter.contextId);
    }

    return results;
  }

  async searchMemories(query: string, limit = 10): Promise<Memory[]> {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.memories.values()).filter(
      (m) =>
        m.content.toLowerCase().includes(lowerQuery) ||
        m.metadata.title?.toLowerCase().includes(lowerQuery) ||
        m.metadata.description?.toLowerCase().includes(lowerQuery) ||
        m.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );

    return results.slice(0, limit);
  }

  // Context operations
  async createContext(context: Context): Promise<Context> {
    this.contexts.set(context.id, context);
    return context;
  }

  async getContext(id: string): Promise<Context | undefined> {
    return this.contexts.get(id);
  }

  async updateContext(id: string, updates: Partial<Context>): Promise<Context | undefined> {
    const context = this.contexts.get(id);
    if (!context) return undefined;

    const updated = {
      ...context,
      ...updates,
      metadata: {
        ...context.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      },
    };

    this.contexts.set(id, updated);
    return updated;
  }

  async deleteContext(id: string): Promise<boolean> {
    return this.contexts.delete(id);
  }

  async listContexts(filter?: { type?: string; active?: boolean }): Promise<Context[]> {
    let results = Array.from(this.contexts.values());

    if (filter?.type) {
      results = results.filter((c) => c.type === filter.type);
    }
    if (filter?.active !== undefined) {
      results = results.filter((c) => c.metadata.active === filter.active);
    }

    return results;
  }

  async addMemoryToContext(contextId: string, memoryId: string): Promise<boolean> {
    const context = this.contexts.get(contextId);
    const memory = this.memories.get(memoryId);

    if (!context || !memory) return false;

    if (!context.memoryIds.includes(memoryId)) {
      context.memoryIds.push(memoryId);
    }

    if (!memory.relations) {
      memory.relations = { relatedIds: [] };
    }
    memory.relations.contextId = contextId;

    return true;
  }

  // Statistics
  async getStats() {
    const memories = Array.from(this.memories.values());
    const contexts = Array.from(this.contexts.values());

    const byCategory = memories.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = memories.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allTags = memories.flatMap((m) => m.metadata.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalMemories: memories.length,
      totalContexts: contexts.length,
      byCategory,
      byType,
      topTags,
    };
  }

  // Seed mock data
  private seedMockData() {
    const now = new Date();

    // Sample memories
    const sampleMemories: Memory[] = [
      {
        id: "mem_001",
        type: "long-term",
        category: "personal",
        content: "I prefer dark mode in all my applications for better eye comfort during long coding sessions.",
        metadata: {
          title: "UI Preference - Dark Mode",
          tags: ["preferences", "ui", "coding"],
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          importance: 3,
          accessCount: 5,
        },
        privacy: {
          encrypted: false,
          accessLevel: "private",
        },
      },
      {
        id: "mem_002",
        type: "long-term",
        category: "professional",
        content: "Always use TypeScript for new projects. It catches bugs early and improves code maintainability.",
        metadata: {
          title: "Coding Standard - TypeScript",
          tags: ["coding", "typescript", "best-practices"],
          createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          importance: 5,
          accessCount: 12,
        },
        privacy: {
          encrypted: false,
          accessLevel: "private",
        },
      },
      {
        id: "mem_003",
        type: "long-term",
        category: "learning",
        content: "Vector embeddings are numerical representations of text that capture semantic meaning. Used in RAG systems for semantic search.",
        metadata: {
          title: "AI Concept - Vector Embeddings",
          description: "Learning about embeddings for the SelfHub project",
          tags: ["ai", "embeddings", "learning", "mcp"],
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          importance: 4,
          accessCount: 8,
        },
        privacy: {
          encrypted: false,
          accessLevel: "private",
        },
      },
      {
        id: "mem_004",
        type: "contextual",
        category: "projects",
        content: "SelfHub uses MCP protocol to provide memory tools to AI assistants. Built with TypeScript and pnpm.",
        metadata: {
          title: "SelfHub Project Overview",
          tags: ["selfhub", "mcp", "project", "typescript"],
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          importance: 5,
          accessCount: 15,
        },
        relations: {
          relatedIds: ["mem_002", "mem_003"],
          contextId: "ctx_001",
        },
        privacy: {
          encrypted: false,
          accessLevel: "private",
        },
      },
      {
        id: "mem_005",
        type: "short-term",
        category: "tasks",
        content: "TODO: Implement the database layer with Drizzle ORM and SQLite for persistent storage.",
        metadata: {
          title: "Next Development Task",
          tags: ["todo", "database", "development"],
          createdAt: now,
          updatedAt: now,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          importance: 4,
          accessCount: 2,
        },
        relations: {
          relatedIds: [],
          contextId: "ctx_001",
        },
        privacy: {
          encrypted: false,
          accessLevel: "private",
        },
      },
      {
        id: "mem_006",
        type: "long-term",
        category: "code",
        content: `// TypeScript utility to generate unique IDs
import { randomUUID } from 'crypto';

export function generateId(prefix: string): string {
  return \`\${prefix}_\${randomUUID().slice(0, 8)}\`;
}`,
        metadata: {
          title: "ID Generation Utility",
          description: "Reusable function for generating unique IDs with prefixes",
          tags: ["code", "typescript", "utility"],
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          importance: 3,
          accessCount: 3,
        },
        privacy: {
          encrypted: false,
          accessLevel: "private",
        },
      },
    ];

    // Sample contexts
    const sampleContexts: Context[] = [
      {
        id: "ctx_001",
        name: "SelfHub Development",
        type: "project",
        description: "All notes and decisions related to building SelfHub MCP server",
        memoryIds: ["mem_004", "mem_005"],
        metadata: {
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: now,
          active: true,
          tags: ["selfhub", "development", "mcp"],
        },
      },
      {
        id: "ctx_002",
        name: "AI & Machine Learning",
        type: "topic",
        description: "Learning resources and notes about AI/ML concepts",
        memoryIds: ["mem_003"],
        metadata: {
          createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          active: true,
          tags: ["ai", "learning", "ml"],
        },
      },
    ];

    // Load into storage
    sampleMemories.forEach((m) => this.memories.set(m.id, m));
    sampleContexts.forEach((c) => this.contexts.set(c.id, c));
  }
}

export const mockStorage = new MockStorage();
