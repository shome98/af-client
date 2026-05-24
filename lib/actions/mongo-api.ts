import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';

import type { AuthApiResponse, ValidationError } from '@/types/auth.types';

import type {
  MongoFieldType,
  MongoFieldConfig,
  RecordDefinition,
  PermissionType,
  ApiDuration,
  CreateDynamicApiPayload,
  DynamicApiSession,
  CrudApiConfig,
  QueryOptions,
  PaginatedResponse,
} from '@/types/mongo.types';

const MONGO_FACTORY_API_BASE_URL =
  process.env.NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL;
const MONGO_FACTORY_API_ADMIN_KEY =
  process.env.NEXT_PUBLIC_MONGO_FACTORY_API_ADMIN_KEY;

if (!MONGO_FACTORY_API_BASE_URL) {
  throw new Error(
    'Missing Mongo Factory API base URL. Set NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL.',
  );
}

if (!MONGO_FACTORY_API_ADMIN_KEY) {
  throw new Error(
    'Missing Mongo Factory API admin key. Set NEXT_PUBLIC_MONGO_FACTORY_API_ADMIN_KEY.',
  );
}

const BASE = `${MONGO_FACTORY_API_BASE_URL.replace(/\/+$/, '')}/api/v1`;

export class MongoApiError extends Error {
  statusCode: number;
  errors?: ValidationError[];

  constructor(message: string, statusCode: number, errors?: ValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Re-export types from types/mongo.types.ts
export type {
  MongoFieldType,
  MongoFieldConfig,
  RecordDefinition,
  PermissionType,
  ApiDuration,
  CreateDynamicApiPayload,
  DynamicApiSession,
  CrudApiConfig,
  QueryOptions,
  PaginatedResponse,
};

// 🚀 AXIOS INSTANCE

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': MONGO_FACTORY_API_ADMIN_KEY,
  },
});

// ⚡ RESPONSE INTERCEPTOR

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<AuthApiResponse>) => {
    const data = error.response?.data;

    throw new MongoApiError(
      data?.message || error.message,
      data?.statusCode || error.response?.status || 500,
      data?.errors ?? undefined,
    );
  },
);

export async function mongoRequest<T>(
  config: AxiosRequestConfig,
  accessToken?: string,
): Promise<AuthApiResponse<T>> {
  const headers: Record<string, string> = {
    ...((config.headers as Record<string, string>) || {}),
    'x-admin-key': MONGO_FACTORY_API_ADMIN_KEY!,
  };

  // Add Authorization header if access token is provided
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await apiClient.request<AuthApiResponse<T>>({
    ...config,
    headers,
    withCredentials: true, // Also send cookies for auth fallback
  });

  const data = response.data;

  if (!data.success) {
    throw new MongoApiError(
      data.message,
      data.statusCode,
      data.errors ?? undefined,
    );
  }

  return data;
}

// 🏭 DYNAMIC API FACTORY

export const mongoFactoryApi = {
  /**
   * Create a new dynamic MongoDB-backed API endpoint
   * @param duration - How long the API should remain active
   * @param payload - API configuration including permissions and record definitions
   * @param accessToken - User's access token for authorization
   */
  createEndpoint: (
    duration: ApiDuration,
    payload: CreateDynamicApiPayload,
    accessToken: string,
  ) =>
    mongoRequest<DynamicApiSession>(
      {
        url: `/create-endpoint/${duration}`,
        method: 'POST',
        data: payload,
      },
      accessToken,
    ),

  /**
   * Regenerate API key for an existing dynamic API
   * @param apiId - The API ID to regenerate key for
   * @param accessToken - User's access token for authorization
   */
  regenerateApiKey: (apiId: string, accessToken: string) =>
    mongoRequest<{ apiId: string; newApiKey: string }>(
      {
        url: `/regenerate-api-key/${apiId}`,
        method: 'POST',
      },
      accessToken,
    ),
};

// 📦 GENERATED API CLIENT (for using created dynamic APIs)

/**
 * Create a CRUD client for a generated dynamic API collection
 * @param config - API configuration with apiId, apiKey, and baseUrl
 * @param collection - The collection name (pluralized record name)
 */
export function createCrudClient<T extends Record<string, unknown>>(
  config: CrudApiConfig,
  collection: string,
) {
  const { apiId, apiKey, baseUrl } = config;
  const basePath = `${baseUrl}/api/v1/temp/${apiId}/${collection}`;

  const crudClient: AxiosInstance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  });

  crudClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<AuthApiResponse>) => {
      const data = error.response?.data;
      throw new MongoApiError(
        data?.message || error.message,
        data?.statusCode || error.response?.status || 500,
        data?.errors ?? undefined,
      );
    },
  );

  return {
    /**
     * Create a new record
     */
    create: async (
      data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>,
    ): Promise<T> => {
      const response = await crudClient.post<AuthApiResponse<T>>(
        basePath,
        data,
      );
      if (!response.data.success) {
        throw new MongoApiError(
          response.data.message,
          response.data.statusCode,
          response.data.errors ?? undefined,
        );
      }
      return response.data.data as T;
    },

    /**
     * List records with optional query parameters
     */
    list: async (options: QueryOptions = {}): Promise<PaginatedResponse<T>> => {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = `${basePath}?${params.toString()}`;
      const response =
        await crudClient.get<AuthApiResponse<PaginatedResponse<T>>>(url);
      if (!response.data.success) {
        throw new MongoApiError(
          response.data.message,
          response.data.statusCode,
          response.data.errors ?? undefined,
        );
      }
      return response.data.data as PaginatedResponse<T>;
    },

    /**
     * Get a single record by ID
     */
    getById: async (id: string): Promise<T> => {
      const response = await crudClient.get<AuthApiResponse<T>>(
        `${basePath}/${id}`,
      );
      if (!response.data.success) {
        throw new MongoApiError(
          response.data.message,
          response.data.statusCode,
          response.data.errors ?? undefined,
        );
      }
      return response.data.data as T;
    },

    /**
     * Update a record by ID
     */
    update: async (id: string, data: Partial<T>): Promise<T> => {
      const response = await crudClient.patch<AuthApiResponse<T>>(
        `${basePath}/${id}`,
        data,
      );
      if (!response.data.success) {
        throw new MongoApiError(
          response.data.message,
          response.data.statusCode,
          response.data.errors ?? undefined,
        );
      }
      return response.data.data as T;
    },

    /**
     * Delete a record by ID (soft delete if enabled)
     */
    delete: async (id: string): Promise<void> => {
      const response = await crudClient.delete<AuthApiResponse<null>>(
        `${basePath}/${id}`,
      );
      if (!response.data.success) {
        throw new MongoApiError(
          response.data.message,
          response.data.statusCode,
          response.data.errors ?? undefined,
        );
      }
    },

    /**
     * Bulk create multiple records
     */
    bulkCreate: async (
      items: Omit<T, '_id' | 'createdAt' | 'updatedAt'>[],
    ): Promise<T[]> => {
      const response = await crudClient.post<AuthApiResponse<T[]>>(
        `${basePath}/bulk-create`,
        items,
      );
      if (!response.data.success) {
        throw new MongoApiError(
          response.data.message,
          response.data.statusCode,
          response.data.errors ?? undefined,
        );
      }
      return response.data.data as T[];
    },

    /**
     * Get count of records with optional filters
     */
    count: async (filters: Record<string, unknown> = {}): Promise<number> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = `${basePath}/advanced/count?${params.toString()}`;
      const response =
        await crudClient.get<AuthApiResponse<{ count: number }>>(url);
      if (!response.data.success) {
        throw new MongoApiError(
          response.data.message,
          response.data.statusCode,
          response.data.errors ?? undefined,
        );
      }
      return (response.data.data as { count: number }).count;
    },
  };
}
