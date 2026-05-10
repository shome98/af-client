// PG Registry API Types

import type { PermissionType, RecordDefinition } from './mongo.types';

export interface ApiRegistryItem {
  id: string;
  userId: string;
  apiId: string;
  name: string;
  description: string | null;
  apiKeyUpdatedAt: string;
  dbName: string;
  dbUri: string;
  databaseType: string;
  permission: PermissionType;
  recordDefinitions: RecordDefinition[];
  endpoints: string[];
  softDelete: boolean;
  textIndexStrategy: string | null;
  hasDocsAccess: boolean;
  rateLimit: number;
  provisionedUser: string | null;
  expirationTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRegistryListResponse {
  success: boolean;
  message: string;
  data: ApiRegistryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiRegistryResponse {
  success: boolean;
  message: string;
  data: ApiRegistryItem;
}

export interface CreateRegistryApiPayload {
  name: string;
  description?: string;
  permission: PermissionType;
  recordDefinitions: RecordDefinition[];
  expirationTime: string;
  apiId?: string;
  dbName?: string;
  dbUri?: string;
  softDelete?: boolean;
  textIndexStrategy?: 'wildcard' | 'explicit';
  hasDocsAccess?: boolean;
  rateLimit?: number;
  provisionedUser?: string;
  endpoints?: string[];
}

export interface CreateRegistryApiResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    apiId: string;
    name: string;
    apiKey: string;
    permission: PermissionType;
    rateLimit: number;
    recordDefinitions: RecordDefinition[];
    expirationTime: string;
  };
}

export interface UpdateRegistryApiPayload {
  name?: string;
  description?: string | null;
  dbName?: string;
  dbUri?: string;
  permission?: PermissionType;
  recordDefinitions?: RecordDefinition[];
  softDelete?: boolean;
  textIndexStrategy?: 'wildcard' | 'explicit' | null;
  hasDocsAccess?: boolean;
  rateLimit?: number;
  provisionedUser?: string | null;
  endpoints?: string[];
  expirationTime?: string;
  isActive?: boolean;
}

export interface RegenerateKeyResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    newApiKey: string;
  };
}

export interface ApiListParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface ApiRegistryState {
  apis: ApiRegistryItem[];
  selectedApi: ApiRegistryItem | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isRegeneratingKey: boolean;
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  regenerateKeyError: string | null;
}
