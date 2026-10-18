import { Memory, Context } from '../models/index.js';
import { MemoryModel, ContextModel } from '../db/schemas.js';

export interface MemoryFilter {
    type?: string;
    category?: string;
    tags?: string[];
    contextId?: string;
}

export class MongoDBStorage {
    // ========== Memory Operations ==========

    async createMemory(memory: Memory): Promise<Memory> {
        const doc = await MemoryModel.create({
            _id: memory.id,
            type: memory.type,
            category: memory.category,
            content: memory.content,
            metadata: memory.metadata,
            relations: memory.relations,
            privacy: memory.privacy,
        });

        return this.docToMemory(doc);
    }

    async getMemory(id: string): Promise<Memory | undefined> {
        const doc = await MemoryModel.findById(id);
        if (!doc) return undefined;

        // Update access count
        if (doc.metadata) {
            doc.metadata.accessCount++;
            doc.metadata.lastAccessedAt = new Date();
            doc.metadata.updatedAt = new Date();
            await doc.save();
        }

        return this.docToMemory(doc);
    }

    async updateMemory(
        id: string,
        updates: Partial<Memory>
    ): Promise<Memory | undefined> {
        const doc = await MemoryModel.findById(id);
        if (!doc) return undefined;

        // Update fields
        if (updates.content !== undefined) doc.content = updates.content;
        if (updates.type !== undefined) doc.type = updates.type;
        if (updates.category !== undefined) doc.category = updates.category;
        if (updates.metadata && doc.metadata) {
            doc.metadata = { ...doc.metadata, ...updates.metadata };
        }
        if (updates.relations) {
            doc.relations = { ...doc.relations, ...updates.relations };
        }
        if (updates.privacy) {
            doc.privacy = { ...doc.privacy, ...updates.privacy };
        }

        if (doc.metadata) {
            doc.metadata.updatedAt = new Date();
        }
        await doc.save();

        return this.docToMemory(doc);
    }

    /** Bulk read for context loading: one query, input order kept, no access-count writes */
    async getMemoriesByIds(ids: string[]): Promise<Memory[]> {
        if (ids.length === 0) return [];
        const docs = await MemoryModel.find({ _id: { $in: ids } });
        const byId = new Map(docs.map((doc) => [String(doc._id), this.docToMemory(doc)]));
        return ids.flatMap((id) => byId.get(id) ?? []);
    }

    async deleteMemory(id: string): Promise<boolean> {
        const result = await MemoryModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) return false;

        // Keep context memory counts honest
        await ContextModel.updateMany({ memoryIds: id }, { $pull: { memoryIds: id } });
        return true;
    }

    async listMemories(
        filter: MemoryFilter = {},
        page: { sortField?: string; sortOrder?: 'asc' | 'desc'; offset?: number; limit?: number } = {}
    ): Promise<{ memories: Memory[]; total: number }> {
        const query = this.buildMemoryQuery(filter);
        const sortField = `metadata.${page.sortField ?? 'createdAt'}`;

        // Sort, skip and limit run in MongoDB; only one page crosses the wire
        const [docs, total] = await Promise.all([
            MemoryModel.find(query)
                .sort({ [sortField]: page.sortOrder === 'asc' ? 1 : -1, _id: 1 })
                .skip(page.offset ?? 0)
                .limit(page.limit ?? 50),
            MemoryModel.countDocuments(query),
        ]);

        return { memories: docs.map((doc) => this.docToMemory(doc)), total };
    }

    async searchMemories(
        text: string,
        filter: MemoryFilter = {},
        limit = 10
    ): Promise<{ results: Array<{ memory: Memory; score: number }>; total: number }> {
        // Filters go into the same query as $text, so they apply before the limit
        const query = { ...this.buildMemoryQuery(filter), $text: { $search: text } };

        const [docs, total] = await Promise.all([
            MemoryModel.find(query, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit),
            MemoryModel.countDocuments(query),
        ]);

        return {
            results: docs.map((doc) => ({
                memory: this.docToMemory(doc),
                score: Math.round((doc.get('score') as number) * 100) / 100,
            })),
            total,
        };
    }

    private buildMemoryQuery(filter: MemoryFilter): Record<string, unknown> {
        const query: Record<string, unknown> = {};

        if (filter.type) query.type = filter.type;
        if (filter.category) query.category = filter.category;
        if (filter.tags && filter.tags.length > 0) {
            query['metadata.tags'] = { $in: filter.tags };
        }
        if (filter.contextId) {
            query['relations.contextId'] = filter.contextId;
        }

        return query;
    }

    // ========== Context Operations ==========

    async createContext(context: Context): Promise<Context> {
        const doc = await ContextModel.create({
            _id: context.id,
            name: context.name,
            type: context.type,
            description: context.description,
            memoryIds: context.memoryIds,
            metadata: context.metadata,
        });

        return this.docToContext(doc);
    }

    async getContext(id: string): Promise<Context | undefined> {
        const doc = await ContextModel.findById(id);
        return doc ? this.docToContext(doc) : undefined;
    }

    async updateContext(
        id: string,
        updates: Partial<Context>
    ): Promise<Context | undefined> {
        const doc = await ContextModel.findById(id);
        if (!doc) return undefined;

        if (updates.name !== undefined) doc.name = updates.name;
        if (updates.description !== undefined) doc.description = updates.description;
        if (updates.metadata && doc.metadata) {
            doc.metadata = { ...doc.metadata, ...updates.metadata };
        }
        if (updates.memoryIds !== undefined) doc.memoryIds = updates.memoryIds;

        if (doc.metadata) {
            doc.metadata.updatedAt = new Date();
        }
        await doc.save();

        return this.docToContext(doc);
    }

    async deleteContext(id: string): Promise<boolean> {
        const result = await ContextModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    async listContexts(filter?: {
        type?: string;
        active?: boolean;
    }): Promise<Context[]> {
        const query: any = {};

        if (filter?.type) query.type = filter.type;
        if (filter?.active !== undefined) query['metadata.active'] = filter.active;

        const docs = await ContextModel.find(query);
        return docs.map((doc) => this.docToContext(doc));
    }

    async addMemoryToContext(contextId: string, memoryId: string): Promise<boolean> {
        const context = await ContextModel.findById(contextId);
        const memory = await MemoryModel.findById(memoryId);

        if (!context || !memory) return false;

        // Add to context's memoryIds
        if (!context.memoryIds.includes(memoryId)) {
            context.memoryIds.push(memoryId);
            if (context.metadata) {
                context.metadata.updatedAt = new Date();
            }
            await context.save();
        }

        // Update memory's contextId
        if (!memory.relations) {
            memory.relations = { relatedIds: [] };
        }
        memory.relations.contextId = contextId;
        if (memory.metadata) {
            memory.metadata.updatedAt = new Date();
        }
        await memory.save();

        return true;
    }

    // ========== Statistics ==========

    async getStats() {
        const [totalMemories, totalContexts, categoryStats, typeStats, tagStats] =
            await Promise.all([
                MemoryModel.countDocuments(),
                ContextModel.countDocuments(),
                // Category breakdown
                MemoryModel.aggregate([
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                ]),
                // Type breakdown
                MemoryModel.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
                // Top tags
                MemoryModel.aggregate([
                    { $unwind: '$metadata.tags' },
                    { $group: { _id: '$metadata.tags', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
            ]);

        const byCategory = categoryStats.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
        }, {} as Record<string, number>);

        const byType = typeStats.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
        }, {} as Record<string, number>);

        const topTags = tagStats.map((item: any) => ({
            tag: item._id,
            count: item.count,
        }));

        return {
            totalMemories,
            totalContexts,
            byCategory,
            byType,
            topTags,
        };
    }

    // ========== Helper Methods ==========

    private docToMemory(doc: any): Memory {
        return {
            id: doc._id.toString(),
            type: doc.type,
            category: doc.category,
            content: doc.content,
            metadata: {
                ...doc.metadata,
                createdAt: doc.metadata.createdAt,
                updatedAt: doc.metadata.updatedAt,
            },
            relations: doc.relations,
            privacy: doc.privacy,
        };
    }

    private docToContext(doc: any): Context {
        return {
            id: doc._id.toString(),
            name: doc.name,
            type: doc.type,
            description: doc.description,
            memoryIds: doc.memoryIds,
            metadata: {
                ...doc.metadata,
                createdAt: doc.metadata.createdAt,
                updatedAt: doc.metadata.updatedAt,
            },
        };
    }
}

export const mongoStorage = new MongoDBStorage();
