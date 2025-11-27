import { Schema, model } from 'mongoose';
import { Memory, Context } from '../models/index.js';

// ========== Memory Schema ==========

const memorySchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['short-term', 'long-term', 'contextual'],
            required: true,
            default: 'long-term',
        },
        category: {
            type: String,
            enum: [
                'personal',
                'professional',
                'learning',
                'projects',
                'conversations',
                'documents',
                'code',
                'tasks',
                'contacts',
                'timeline',
                'custom',
            ],
            required: true,
            default: 'custom',
        },
        content: {
            type: String,
            required: true,
            maxlength: 50000,
        },
        metadata: {
            title: { type: String, maxlength: 200 },
            description: { type: String, maxlength: 1000 },
            tags: [{ type: String, maxlength: 50 }],
            importance: {
                type: Number,
                min: 1,
                max: 5,
                default: 3,
            },
            accessCount: {
                type: Number,
                default: 0,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            updatedAt: {
                type: Date,
                default: Date.now,
            },
            expiresAt: Date,
            lastAccessedAt: Date,
        },
        relations: {
            parentId: String,
            relatedIds: [String],
            contextId: String,
        },
        privacy: {
            encrypted: {
                type: Boolean,
                default: false,
            },
            accessLevel: {
                type: String,
                enum: ['private', 'shared', 'public'],
                default: 'private',
            },
        },
    },
    {
        _id: false, // Don't auto-create _id, we provide it
        timestamps: false, // We manage timestamps manually
        collection: 'memories',
    }
);

// Indexes for performance
memorySchema.index({ 'metadata.tags': 1 });
memorySchema.index({ category: 1 });
memorySchema.index({ type: 1 });
memorySchema.index({ 'relations.contextId': 1 });
memorySchema.index({ 'metadata.createdAt': -1 });
memorySchema.index({ 'metadata.importance': -1 });

// Text search index
memorySchema.index({
    content: 'text',
    'metadata.title': 'text',
    'metadata.description': 'text',
});

export const MemoryModel = model('Memory', memorySchema);

// ========== Context Schema ==========

const contextSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            maxlength: 100,
        },
        type: {
            type: String,
            enum: ['project', 'conversation', 'topic', 'temporal'],
            required: true,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        memoryIds: [String],
        metadata: {
            tags: [{ type: String, maxlength: 50 }],
            active: {
                type: Boolean,
                default: false,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            updatedAt: {
                type: Date,
                default: Date.now,
            },
        },
    },
    {
        _id: false, // Don't auto-create _id, we provide it
        timestamps: false, // We manage timestamps manually
        collection: 'contexts',
    }
);

// Indexes
contextSchema.index({ type: 1 });
contextSchema.index({ 'metadata.active': 1 });

export const ContextModel = model('Context', contextSchema);
