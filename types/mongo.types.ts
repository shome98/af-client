// Mongo Factory API Types

// Supported field types for MongoDB schema
export type MongoFieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'ObjectId'
  | 'Mixed';

// Field configuration options
export interface MongoFieldConfig {
  type: MongoFieldType;
  required?: boolean;
  unique?: boolean;
  ref?: string;
  enum?: string[];
  default?: unknown;
  min?: number;
  max?: number;
  message?: string;
  select?: boolean;
  match?: string;
  searchable?: boolean;
}

// Record definition for a collection
export interface RecordDefinition {
  record_name: string;
  record_config: Record<string, MongoFieldConfig>;
}

// Permission types
export type PermissionType = 'SCRUD' | 'SCRUDQ' | 'MCRUD' | 'MCRUDQ';

// Duration values for API creation
export type ApiDuration =
  | '15-mins'
  | '20-mins'
  | '1-hour'
  | '12-hours'
  | '1-day'
  | '7-days'
  | '15-days'
  | '30-days'
  | '1-year';

// Request body for creating a dynamic API
export interface CreateDynamicApiPayload {
  permission: PermissionType;
  soft_delete?: boolean;
  textIndexStrategy?: 'wildcard' | 'explicit';
  dbName?: string;
  dbUri?: string;
  recordDefinitions: RecordDefinition[];
}

// Response data from creating a dynamic API
export interface DynamicApiSession {
  apiId: string;
  apiKey: string;
  endpoints: string[];
  collections: string[];
  instanceDetails: {
    dbUri: string;
    dbName: string;
  };
  expiresAt: string;
  checkDocsAt: string;
}

// CRUD API Configuration
export interface CrudApiConfig {
  apiId: string;
  apiKey: string;
  baseUrl: string;
}

// Query options for list operations
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  populate?: string;
  search?: string;
  [key: string]: unknown;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Mongo API Error structure
export interface MongoApiError {
  message: string;
  statusCode: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
