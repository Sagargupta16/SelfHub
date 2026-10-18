/**
 * Memory service - Business logic for memory operations
 */

import { randomUUID } from "crypto";
import {
  Memory,
  CreateMemoryInput,
  UpdateMemoryInput,
  SearchMemoriesInput,
  ListMemoriesInput,
} from "../models/index.js";
import { mongoStorage as storage } from "../storage/mongodb-storage.js";


export class MemoryService {
  async storeMemory(input: CreateMemoryInput): Promise<Memory> {
    const now = new Date();

    const memory: Memory = {
      id: `mem_${randomUUID().slice(0, 8)}`,
      type: input.type || "long-term",
      category: input.category || "custom",
      content: input.content,
      metadata: {
        title: input.metadata?.title,
        description: input.metadata?.description,
        tags: input.metadata?.tags || [],
        source: input.metadata?.source,
        createdAt: now,
        updatedAt: now,
        expiresAt: input.metadata?.expiresAt,
        importance: input.metadata?.importance || 3,
        accessCount: 0,
      },
      relations: input.contextId
        ? {
          relatedIds: [],
          contextId: input.contextId,
        }
        : undefined,
      privacy: {
        encrypted: input.encrypt || false,
        accessLevel: "private",
      },
    };

    await storage.createMemory(memory);

    // If context is provided, add to context
    if (input.contextId) {
      await storage.addMemoryToContext(input.contextId, memory.id);
    }

    return memory;
  }

  async retrieveMemory(id: string): Promise<Memory | null> {
    const memory = await storage.getMemory(id);
    return memory || null;
  }

  async updateMemory(input: UpdateMemoryInput): Promise<Memory | null> {
    const updates: Partial<Memory> = {};

    if (input.content) updates.content = input.content;
    if (input.type) updates.type = input.type;
    if (input.metadata) {
      updates.metadata = input.metadata as any;
    }

    const updated = await storage.updateMemory(input.id, updates);
    return updated || null;
  }

  async deleteMemory(id: string): Promise<boolean> {
    return await storage.deleteMemory(id);
  }

  async listMemories(input: ListMemoriesInput = {}): Promise<{
    memories: Memory[];
    total: number;
  }> {
    return await storage.listMemories(
      {
        type: input.type,
        category: input.category,
        tags: input.tags,
        contextId: input.contextId,
      },
      {
        sortField: input.sortBy || "createdAt",
        sortOrder: input.sortOrder || "desc",
        offset: input.offset || 0,
        limit: input.limit || 50,
      }
    );
  }

  async searchMemories(input: SearchMemoriesInput): Promise<{
    results: Array<{ memory: Memory; relevance: string; score: number }>;
    total: number;
  }> {
    const { results, total } = await storage.searchMemories(
      input.query,
      { type: input.type, category: input.category, tags: input.tags },
      input.limit || 10
    );

    // Results are ranked by MongoDB textScore; relevance is the importance label
    return {
      results: results.map(({ memory, score }) => ({
        memory,
        score,
        relevance: memory.metadata.importance >= 4 ? "high" : memory.metadata.importance >= 3 ? "medium" : "low",
      })),
      total,
    };
  }

  async getStats() {
    return await storage.getStats();

  }
}

export const memoryService = new MemoryService();
