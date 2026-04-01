import axios, { AxiosError, type AxiosInstance } from 'axios';

import type {
  ApiRegistryListResponse,
  ApiRegistryResponse,
  CreateRegistryApiPayload,
  CreateRegistryApiResponse,
  UpdateRegistryApiPayload,
  RegenerateKeyResponse,
  ApiListParams,
} from '@/types/registry.types';

const PG_REGISTRY_API_BASE_URL =
  process.env.NEXT_PUBLIC_PG_REGISTRY_API_BASE_URL;

if (!PG_REGISTRY_API_BASE_URL) {
  throw new Error(
    'Missing PG Registry API base URL. Set NEXT_PUBLIC_PG_REGISTRY_API_BASE_URL.',
  );
}

const BASE = `${PG_REGISTRY_API_BASE_URL.replace(/\/+$/, '')}/api/v1`;

export class RegistryApiError extends Error {
  statusCode: number;
  errors?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Axios instance for registry API
const registryClient: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies for auth
});

// Response interceptor for error handling
registryClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiRegistryResponse>) => {
    const data = error.response?.data;
    const statusCode = error.response?.status || 500;

    throw new RegistryApiError(
      data?.message || error.message,
      statusCode,
      (data as unknown as { errors?: Array<{ path: string; message: string }> })
        ?.errors,
    );
  },
);

// Helper to build query string
function buildQueryString(params: ApiListParams): string {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined)
    searchParams.append('page', String(params.page));
  if (params.limit !== undefined)
    searchParams.append('limit', String(params.limit));
  if (params.isActive !== undefined)
    searchParams.append('isActive', String(params.isActive));
  if (params.search) searchParams.append('search', params.search);
  return searchParams.toString();
}

export const registryApi = {
  /**
   * List all API records for the authenticated user
   */
  async listApis(params: ApiListParams = {}): Promise<ApiRegistryListResponse> {
    const queryString = buildQueryString(params);
    const url = `/mongo-apis${queryString ? `?${queryString}` : ''}`;
    const response = await registryClient.get<ApiRegistryListResponse>(url);
    return response.data;
  },

  /**
   * Get a single API record by its PG UUID
   */
  async getApiById(id: string): Promise<ApiRegistryResponse> {
    const response = await registryClient.get<ApiRegistryResponse>(
      `/mongo-apis/${id}`,
    );
    return response.data;
  },

  /**
   * Get a single API record by its apiId (16-char hex string)
   */
  async getApiByApiId(apiId: string): Promise<ApiRegistryResponse> {
    const response = await registryClient.get<ApiRegistryResponse>(
      `/mongo-apis/by-api-id/${apiId}`,
    );
    return response.data;
  },

  /**
   * Create a new API registry record
   * Note: This is different from creating a dynamic API - this registers it in PG
   */
  async createApi(
    payload: CreateRegistryApiPayload,
  ): Promise<CreateRegistryApiResponse> {
    const response = await registryClient.post<CreateRegistryApiResponse>(
      '/mongo-apis',
      payload,
    );
    return response.data;
  },

  /**
   * Partially update an API record
   */
  async updateApi(
    id: string,
    payload: UpdateRegistryApiPayload,
  ): Promise<ApiRegistryResponse> {
    const response = await registryClient.patch<ApiRegistryResponse>(
      `/mongo-apis/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * Soft delete an API record (sets isActive = false)
   */
  async softDeleteApi(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await registryClient.delete<{
      success: boolean;
      message: string;
    }>(`/mongo-apis/${id}`);
    return response.data;
  },

  /**
   * Hard delete an API record (permanently removed)
   */
  async hardDeleteApi(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await registryClient.delete<{
      success: boolean;
      message: string;
    }>(`/mongo-apis/${id}/hard`);
    return response.data;
  },

  /**
   * Regenerate API key for an existing API
   */
  async regenerateApiKey(id: string): Promise<RegenerateKeyResponse> {
    const response = await registryClient.post<RegenerateKeyResponse>(
      `/mongo-apis/${id}/regenerate-key`,
    );
    return response.data;
  },
};
