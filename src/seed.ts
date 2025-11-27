#!/usr/bin/env node

/**
 * Seed the database with sample data
 * Makes it easy to get started!
 */

import { connectDatabase } from './db/connection.js';
import { MemoryModel, ContextModel } from './db/schemas.js';

async function seedDatabase() {
    console.log('🌱 Seeding SelfHub Database...\n');

    try {
        // Connect to MongoDB
        await connectDatabase();

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await MemoryModel.deleteMany({});
        await ContextModel.deleteMany({});
        console.log('   ✅ Database cleared\n');

        const now = new Date();

        // Create sample memories
        console.log('📝 Creating sample memories...');
        const memories = await MemoryModel.create([
            {
                _id: 'mem_sample_001',
                type: 'long-term',
                category: 'personal',
                content:
                    'I prefer dark mode in all my applications. It helps reduce eye strain during long coding sessions.',
                metadata: {
                    title: 'UI Preference - Dark Mode',
                    tags: ['preferences', 'ui', 'coding'],
                    importance: 3,
                    accessCount: 0,
                    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                },
                privacy: {
                    encrypted: false,
                    accessLevel: 'private',
                },
            },
            {
                _id: 'mem_sample_002',
                type: 'long-term',
                category: 'professional',
                content:
                    'Always use TypeScript for new projects. Type safety catches bugs early and improves code maintainability.',
                metadata: {
                    title: 'Best Practice - TypeScript',
                    tags: ['coding', 'typescript', 'best-practices'],
                    importance: 5,
                    accessCount: 0,
                    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
                },
                privacy: {
                    encrypted: false,
                    accessLevel: 'private',
                },
            },
            {
                _id: 'mem_sample_003',
                type: 'long-term',
                category: 'learning',
                content:
                    'MongoDB is a NoSQL database that stores data in flexible, JSON-like documents. Perfect for applications where data structure may evolve over time.',
                metadata: {
                    title: 'Database - MongoDB Basics',
                    tags: ['mongodb', 'database', 'learning'],
                    importance: 4,
                    accessCount: 0,
                    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
                },
                privacy: {
                    encrypted: false,
                    accessLevel: 'private',
                },
            },
            {
                _id: 'mem_sample_004',
                type: 'short-term',
                category: 'tasks',
                content: 'Remember to update the README with the new MongoDB setup instructions.',
                metadata: {
                    title: 'TODO - Update Documentation',
                    tags: ['todo', 'documentation'],
                    importance: 3,
                    accessCount: 0,
                    createdAt: now,
                    updatedAt: now,
                },
                privacy: {
                    encrypted: false,
                    accessLevel: 'private',
                },
            },
            {
                _id: 'mem_sample_005',
                type: 'long-term',
                category: 'code',
                content:
                    'Useful npm commands: pnpm dev (development), pnpm build (production build), pnpm test (run tests), pnpm lint (check code quality).',
                metadata: {
                    title: 'Quick Reference - NPM Commands',
                    tags: ['npm', 'commands', 'reference'],
                    importance: 4,
                    accessCount: 0,
                    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
                },
                privacy: {
                    encrypted: false,
                    accessLevel: 'private',
                },
            },
            {
                _id: 'mem_sample_006',
                type: 'contextual',
                category: 'projects',
                content:
                    'SelfHub is a personal AI memory hub using the Model Context Protocol (MCP). It allows AI assistants to store and retrieve user information persistently.',
                metadata: {
                    title: 'Project - SelfHub Overview',
                    tags: ['selfhub', 'mcp', 'project'],
                    importance: 5,
                    accessCount: 0,
                    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
                },
                privacy: {
                    encrypted: false,
                    accessLevel: 'private',
                },
            },
        ]);
        console.log(`   ✅ Created ${memories.length} sample memories\n`);

        // Create sample contexts
        console.log('🗂️  Creating sample contexts...');
        const contexts = await ContextModel.create([
            {
                _id: 'ctx_sample_001',
                name: 'SelfHub Development',
                type: 'project',
                description: 'All notes and decisions related to building SelfHub MCP server',
                memoryIds: ['mem_sample_002', 'mem_sample_003', 'mem_sample_004', 'mem_sample_006'],
                metadata: {
                    tags: ['selfhub', 'development', 'mcp'],
                    active: true,
                    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
                    updatedAt: now,
                },
            },
            {
                _id: 'ctx_sample_002',
                name: 'Personal Preferences',
                type: 'topic',
                description: 'My personal preferences and settings',
                memoryIds: ['mem_sample_001'],
                metadata: {
                    tags: ['preferences', 'personal'],
                    active: false,
                    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        ]);
        console.log(`   ✅ Created ${contexts.length} sample contexts\n`);

        // Summary
        console.log('✨ Seeding Complete!\n');
        console.log('📊 Summary:');
        console.log(`   • ${memories.length} memories created`);
        console.log(`   • ${contexts.length} contexts created`);
        console.log(`   • 1 active context (SelfHub Development)\n`);
        console.log('🚀 Your database is ready!');
        console.log('💡 Start the server with: pnpm start\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
