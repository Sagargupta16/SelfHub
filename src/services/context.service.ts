/**
 * Context service - Business logic for context operations
 */

import { randomUUID } from "crypto";
import { Context, CreateContextInput, UpdateContextInput } from "../models/index.js";
import { mongoStorage as storage } from "../storage/mongodb-storage.js";


export class ContextService {
  async createContext(input: CreateContextInput): Promise<Context> {
    const now = new Date();

    const context: Context = {
      id: `ctx_${randomUUID().slice(0, 8)}`,
      name: input.name,
      type: input.type,
      description: input.description,
      memoryIds: input.memoryIds || [],
      metadata: {
        createdAt: now,
        updatedAt: now,
        active: false,
        tags: input.tags || [],
      },
    };

    await storage.createContext(context);

    // Add memories to context if provided
    if (input.memoryIds) {
      for (const memoryId of input.memoryIds) {
        await storage.addMemoryToContext(context.id, memoryId);
      }
    }

    return context;
  }

  async getContext(id: string): Promise<Context | null> {
    const context = await storage.getContext(id);
    return context || null;
  }

  async updateContext(input: UpdateContextInput): Promise<Context | null> {
    const updates: Partial<Context> = {};

    if (input.name) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.tags) {
      updates.metadata = { tags: input.tags } as any;
    }
    if (input.active !== undefined) {
      updates.metadata = { ...updates.metadata, active: input.active } as any;
    }

    const updated = await storage.updateContext(input.id, updates);
    return updated || null;
  }

  async deleteContext(id: string): Promise<boolean> {
    return await storage.deleteContext(id);
  }

  async listContexts(filter?: { type?: string; active?: boolean }): Promise<Context[]> {
    return await storage.listContexts(filter);
  }

  async activateContext(id: string): Promise<Context | null> {
    // Deactivate all contexts first
    const allContexts = await storage.listContexts();
    for (const ctx of allContexts) {
      if (ctx.metadata.active) {
        await storage.updateContext(ctx.id, {
          metadata: { ...ctx.metadata, active: false },
        });
      }
    }

    // Activate the requested context
    const updated = await storage.updateContext(id, {
      metadata: { active: true } as any,
    });

    return updated || null;
  }

  async addMemoryToContext(contextId: string, memoryId: string): Promise<boolean> {
    return await storage.addMemoryToContext(contextId, memoryId);
  }

  async getContextMemories(contextId: string) {
    const context = await storage.getContext(contextId);
    if (!context) return [];

    const memories = [];
    for (const memoryId of context.memoryIds) {
      const memory = await storage.getMemory(memoryId);
      if (memory) memories.push(memory);
    }

    return memories;

  }
}

export const contextService = new ContextService();
