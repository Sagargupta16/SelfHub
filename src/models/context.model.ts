/**
 * Context type definitions
 */

export type ContextType = "project" | "conversation" | "topic" | "temporal";

export interface ContextMetadata {
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  tags: string[];
}

export interface Context {
  id: string;
  name: string;
  type: ContextType;
  description?: string;
  memoryIds: string[];
  metadata: ContextMetadata;
}

export interface CreateContextInput {
  name: string;
  type: ContextType;
  description?: string;
  tags?: string[];
  memoryIds?: string[];
}

export interface UpdateContextInput {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  active?: boolean;
}
