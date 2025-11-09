/**
 * Memory type definitions
 */

export type MemoryType = "short-term" | "long-term" | "contextual";

export type DataCategory =
  | "personal"
  | "professional"
  | "learning"
  | "projects"
  | "conversations"
  | "documents"
  | "code"
  | "tasks"
  | "contacts"
  | "timeline"
  | "custom";

export interface MemoryMetadata {
  title?: string;
  description?: string;
  tags: string[];
  source?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  importance: 1 | 2 | 3 | 4 | 5;
  accessCount: number;
  lastAccessedAt?: Date;
}

export interface MemoryRelations {
  parentId?: string;
  relatedIds: string[];
  contextId?: string;
}

export interface MemoryPrivacy {
  encrypted: boolean;
  accessLevel: "private" | "shared" | "public";
}

export interface Memory {
  id: string;
  type: MemoryType;
  category: DataCategory;
  content: string;
  metadata: MemoryMetadata;
  relations?: MemoryRelations;
  privacy: MemoryPrivacy;
}

export interface CreateMemoryInput {
  content: string;
  type?: MemoryType;
  category?: DataCategory;
  metadata?: Partial<MemoryMetadata>;
  contextId?: string;
  encrypt?: boolean;
}

export interface UpdateMemoryInput {
  id: string;
  content?: string;
  type?: MemoryType;
  metadata?: Partial<MemoryMetadata>;
}

export interface SearchMemoriesInput {
  query: string;
  category?: DataCategory;
  tags?: string[];
  type?: MemoryType;
  limit?: number;
  offset?: number;
}

export interface ListMemoriesInput {
  type?: MemoryType;
  category?: DataCategory;
  tags?: string[];
  contextId?: string;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "updatedAt" | "importance" | "accessCount";
  sortOrder?: "asc" | "desc";
}
