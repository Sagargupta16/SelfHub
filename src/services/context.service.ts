/**
 * Context service - Business logic for context operations
 */

import { randomUUID } from "crypto";
import { Context, CreateContextInput, UpdateContextInput } from "../models/index.js";
import { mockStorage } from "../storage/mock-storage.js";

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

    await mockStorage.createContext(context);

    // Add memories to context if provided
    if (input.memoryIds) {
      for (const memoryId of input.memoryIds) {
        await mockStorage.addMemoryToContext(context.id, memoryId);
      }
    }

    return context;
  }

  async getContext(id: string): Promise<Context | null> {
    const context = await mockStorage.getContext(id);
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

    const updated = await mockStorage.updateContext(input.id, updates);
    return updated || null;
  }

  async deleteContext(id: string): Promise<boolean> {
    return await mockStorage.deleteContext(id);
  }

  async listContexts(filter?: { type?: string; active?: boolean }): Promise<Context[]> {
    return await mockStorage.listContexts(filter);
  }

  async activateContext(id: string): Promise<Context | null> {
    // Deactivate all contexts first
    const allContexts = await mockStorage.listContexts();
    for (const ctx of allContexts) {
      if (ctx.metadata.active) {
        await mockStorage.updateContext(ctx.id, {
          metadata: { ...ctx.metadata, active: false },
        });
      }
    }

    // Activate the requested context
    const updated = await mockStorage.updateContext(id, {
      metadata: { active: true } as any,
    });

    return updated || null;
  }

  async addMemoryToContext(contextId: string, memoryId: string): Promise<boolean> {
    return await mockStorage.addMemoryToContext(contextId, memoryId);
  }

  async getContextMemories(contextId: string) {
    const context = await mockStorage.getContext(contextId);
    if (!context) return [];

    const memories = [];
    for (const memoryId of context.memoryIds) {
      const memory = await mockStorage.getMemory(memoryId);
      if (memory) memories.push(memory);
    }

    return memories;
  }
}

export const contextService = new ContextService();
