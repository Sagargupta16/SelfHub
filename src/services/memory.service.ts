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
    const memories = await storage.listMemories({
      type: input.type,
      category: input.category,
      tags: input.tags,
      contextId: input.contextId,
    });

    // Sort
    const sortBy = input.sortBy || "createdAt";
    const sortOrder = input.sortOrder || "desc";

    memories.sort((a: Memory, b: Memory) => {
      let aVal: number, bVal: number;

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aVal = a.metadata[sortBy].getTime();
        bVal = b.metadata[sortBy].getTime();
      } else {
        aVal = a.metadata[sortBy] as number;
        bVal = b.metadata[sortBy] as number;
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    // Pagination
    const limit = input.limit || 50;
    const offset = input.offset || 0;
    const paginated = memories.slice(offset, offset + limit);

    return {
      memories: paginated,
      total: memories.length,
    };
  }

  async searchMemories(input: SearchMemoriesInput): Promise<{
    results: Array<{ memory: Memory; relevance: string }>;
    total: number;
  }> {
    const limit = input.limit || 10;
    let memories = await storage.searchMemories(input.query, 100);

    // Apply filters
    if (input.category) {
      memories = memories.filter((m: Memory) => m.category === input.category);
    }
    if (input.type) {
      memories = memories.filter((m: Memory) => m.type === input.type);
    }
    if (input.tags && input.tags.length > 0) {
      memories = memories.filter((m: Memory) =>
        input.tags!.some((tag) => m.metadata.tags.includes(tag))
      );
    }

    // Simple relevance scoring based on access count and importance
    const results = memories
      .map((memory: Memory) => ({
        memory,
        relevance: memory.metadata.importance >= 4 ? "high" : memory.metadata.importance >= 3 ? "medium" : "low",
      }))
      .slice(0, limit);

    return {
      results,
      total: memories.length,
    };
  }

  async getStats() {
    return await storage.getStats();

  }
}

export const memoryService = new MemoryService();
