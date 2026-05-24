'use client';

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { registryApi, RegistryApiError } from '@/lib/actions/registry-api';
import type {
  ApiListParams,
  CreateRegistryApiPayload,
  UpdateRegistryApiPayload,
  ApiRegistryState,
} from '@/types/registry.types';

const initialState: ApiRegistryState = {
  apis: [],
  selectedApi: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isRegeneratingKey: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  regenerateKeyError: null,
};

// Async Thunks

export const fetchApis = createAsyncThunk(
  'registry/fetchApis',
  async (params: ApiListParams = {}, { rejectWithValue }) => {
    try {
      const response = await registryApi.listApis(params);
      return {
        apis: response.data,
        meta: response.meta,
      };
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch APIs');
    }
  },
);

export const fetchApiById = createAsyncThunk(
  'registry/fetchApiById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await registryApi.getApiById(id);
      return response.data;
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch API details');
    }
  },
);

export const fetchApiByApiId = createAsyncThunk(
  'registry/fetchApiByApiId',
  async (apiId: string, { rejectWithValue }) => {
    try {
      const response = await registryApi.getApiByApiId(apiId);
      return response.data;
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch API details');
    }
  },
);

export const createRegistryApi = createAsyncThunk(
  'registry/createApi',
  async (payload: CreateRegistryApiPayload, { rejectWithValue }) => {
    try {
      const response = await registryApi.createApi(payload);
      return response.data;
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue({
          message: error.message,
          errors: error.errors,
        });
      }
      return rejectWithValue({ message: 'Failed to create API' });
    }
  },
);

export const updateRegistryApi = createAsyncThunk(
  'registry/updateApi',
  async (
    { id, payload }: { id: string; payload: UpdateRegistryApiPayload },
    { getState, rejectWithValue },
  ) => {
    try {
      const { corsPolicy, corsList, credentials, ...registryPayload } = payload;
      const hasCorsUpdate =
        corsPolicy !== undefined || corsList !== undefined;
      const hasRegistryUpdate = Object.keys(registryPayload).length > 0;

      const state = getState() as { registry: ApiRegistryState };
      const currentApi =
        state.registry.selectedApi ??
        state.registry.apis.find((api) => api.id === id) ??
        null;

      let response = hasRegistryUpdate
        ? await registryApi.updateApi(id, registryPayload)
        : currentApi
          ? {
              success: true,
              message: 'No registry fields changed',
              data: currentApi,
            }
          : await registryApi.getApiById(id);

      if (hasCorsUpdate) {
        const apiId = response.data.apiId ?? currentApi?.apiId;
        if (!apiId) {
          return rejectWithValue({
            message: 'Failed to resolve API ID for CORS update',
          });
        }

        await registryApi.updateCorsPolicy(apiId, {
          ...(corsPolicy !== undefined && { corsPolicy }),
          ...(corsList !== undefined && { corsList }),
          ...(credentials !== undefined && { credentials }),
        });

        response = await registryApi.getApiById(id);
      }

      return response.data;
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue({
          message: error.message,
          errors: error.errors,
        });
      }
      return rejectWithValue({ message: 'Failed to update API' });
    }
  },
);

export const softDeleteRegistryApi = createAsyncThunk(
  'registry/softDeleteApi',
  async (id: string, { rejectWithValue }) => {
    try {
      await registryApi.softDeleteApi(id);
      return id;
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to deactivate API');
    }
  },
);

export const hardDeleteRegistryApi = createAsyncThunk(
  'registry/hardDeleteApi',
  async (id: string, { rejectWithValue }) => {
    try {
      await registryApi.hardDeleteApi(id);
      return id;
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete API');
    }
  },
);

export const regenerateRegistryApiKey = createAsyncThunk(
  'registry/regenerateApiKey',
  async ({ id, apiId }: { id: string; apiId: string }, { rejectWithValue }) => {
    try {
      const response = await registryApi.regenerateApiKey(apiId);
      return {
        id,
        newApiKey: response.data.newApiKey,
      };
    } catch (error) {
      if (error instanceof RegistryApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to regenerate API key');
    }
  },
);

// Slice

const registrySlice = createSlice({
  name: 'registry',
  initialState,
  reducers: {
    clearSelectedApi(state) {
      state.selectedApi = null;
    },
    clearErrors(state) {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.regenerateKeyError = null;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.pagination.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch APIs
      .addCase(fetchApis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.apis = action.payload.apis;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchApis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch APIs';
      })

      // Fetch API by ID
      .addCase(fetchApiById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApiById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedApi = action.payload;
      })
      .addCase(fetchApiById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch API details';
      })

      // Fetch API by ApiId
      .addCase(fetchApiByApiId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApiByApiId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedApi = action.payload;
      })
      .addCase(fetchApiByApiId.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch API details';
      })

      // Create API
      .addCase(createRegistryApi.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createRegistryApi.fulfilled, (state) => {
        state.isCreating = false;
        // Add the new API to the list if we have the full item
        // Note: create response doesn't include all fields, so we might need to refetch
      })
      .addCase(createRegistryApi.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as
          | { message?: string; errors?: unknown }
          | undefined;
        state.createError = payload?.message || 'Failed to create API';
      })

      // Update API
      .addCase(updateRegistryApi.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateRegistryApi.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update in the list
        const index = state.apis.findIndex(
          (api) => api.id === action.payload.id,
        );
        if (index !== -1) {
          state.apis[index] = action.payload;
        }
        // Update selected if matches
        if (state.selectedApi?.id === action.payload.id) {
          state.selectedApi = action.payload;
        }
      })
      .addCase(updateRegistryApi.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as { message?: string } | undefined;
        state.updateError = payload?.message || 'Failed to update API';
      })

      // Soft Delete API
      .addCase(softDeleteRegistryApi.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(softDeleteRegistryApi.fulfilled, (state, action) => {
        state.isDeleting = false;
        // Mark as inactive in the list
        const api = state.apis.find((a) => a.id === action.payload);
        if (api) {
          api.isActive = false;
        }
        if (state.selectedApi?.id === action.payload) {
          state.selectedApi.isActive = false;
        }
      })
      .addCase(softDeleteRegistryApi.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError =
          (action.payload as string) || 'Failed to deactivate API';
      })

      // Hard Delete API
      .addCase(hardDeleteRegistryApi.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(hardDeleteRegistryApi.fulfilled, (state, action) => {
        state.isDeleting = false;
        // Remove from list
        state.apis = state.apis.filter((api) => api.id !== action.payload);
        if (state.selectedApi?.id === action.payload) {
          state.selectedApi = null;
        }
      })
      .addCase(hardDeleteRegistryApi.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError =
          (action.payload as string) || 'Failed to delete API';
      })

      // Regenerate API Key
      .addCase(regenerateRegistryApiKey.pending, (state) => {
        state.isRegeneratingKey = true;
        state.regenerateKeyError = null;
      })
      .addCase(regenerateRegistryApiKey.fulfilled, (state) => {
        state.isRegeneratingKey = false;
        // Note: We don't store the API key in state for security
        // The component should handle displaying it to the user
      })
      .addCase(regenerateRegistryApiKey.rejected, (state, action) => {
        state.isRegeneratingKey = false;
        state.regenerateKeyError =
          (action.payload as string) || 'Failed to regenerate API key';
      });
  },
});

export const { clearSelectedApi, clearErrors, setPage, setLimit } =
  registrySlice.actions;

export const registryReducer = registrySlice.reducer;

// Selectors

export const selectRegistryApis = (state: { registry: ApiRegistryState }) =>
  state.registry.apis;

export const selectSelectedApi = (state: { registry: ApiRegistryState }) =>
  state.registry.selectedApi;

export const selectRegistryPagination = (state: {
  registry: ApiRegistryState;
}) => state.registry.pagination;

export const selectRegistryLoading = (state: { registry: ApiRegistryState }) =>
  state.registry.isLoading;

export const selectRegistryCreating = (state: { registry: ApiRegistryState }) =>
  state.registry.isCreating;

export const selectRegistryUpdating = (state: { registry: ApiRegistryState }) =>
  state.registry.isUpdating;

export const selectRegistryDeleting = (state: { registry: ApiRegistryState }) =>
  state.registry.isDeleting;

export const selectRegistryRegeneratingKey = (state: {
  registry: ApiRegistryState;
}) => state.registry.isRegeneratingKey;

export const selectRegistryError = (state: { registry: ApiRegistryState }) =>
  state.registry.error;

export const selectRegistryCreateError = (state: {
  registry: ApiRegistryState;
}) => state.registry.createError;

export const selectRegistryUpdateError = (state: {
  registry: ApiRegistryState;
}) => state.registry.updateError;

export const selectRegistryDeleteError = (state: {
  registry: ApiRegistryState;
}) => state.registry.deleteError;

export const selectRegistryRegenerateKeyError = (state: {
  registry: ApiRegistryState;
}) => state.registry.regenerateKeyError;

export const selectActiveApis = (state: { registry: ApiRegistryState }) =>
  state.registry.apis.filter((api) => api.isActive);

export const selectExpiredApis = (state: { registry: ApiRegistryState }) =>
  state.registry.apis.filter((api) => {
    if (!api.isActive) return false;
    return new Date(api.expirationTime) < new Date();
  });
