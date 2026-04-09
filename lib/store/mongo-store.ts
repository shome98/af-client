'use client';

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { mongoFactoryApi, createCrudClient } from '@/lib/actions/mongo-api';
import type { ValidationError } from '@/types/auth.types';
import type {
  CreateDynamicApiPayload,
  DynamicApiSession,
  ApiDuration,
  CrudApiConfig,
} from '@/types/mongo.types';

export interface MongoApiState {
  // Current API session
  apiSession: DynamicApiSession | null;
  // Loading states
  isCreating: boolean;
  isRegeneratingKey: boolean;
  // Error states
  createError: string | null;
  createValidationErrors: ValidationError[] | null;
  regenerateKeyError: string | null;
  // Hydration
  isHydrated: boolean;
}

const initialState: MongoApiState = {
  apiSession: null,
  isCreating: false,
  isRegeneratingKey: false,
  createError: null,
  createValidationErrors: null,
  regenerateKeyError: null,
  isHydrated: false,
};

// 🔄 ASYNC THUNKS

/**
 * Create a new dynamic MongoDB API endpoint
 */
export const createDynamicApi = createAsyncThunk(
  'mongoApi/create',
  async (
    {
      duration,
      payload,
      accessToken,
    }: {
      duration: ApiDuration;
      payload: CreateDynamicApiPayload;
      accessToken: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await mongoFactoryApi.createEndpoint(
        duration,
        payload,
        accessToken,
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a MongoApiError with validation errors
        const mongoError = error as {
          errors?: ValidationError[];
          statusCode?: number;
        };
        if (mongoError.errors && mongoError.errors.length > 0) {
          return rejectWithValue({
            message: error.message,
            errors: mongoError.errors,
          });
        }
        return rejectWithValue({ message: error.message });
      }
      return rejectWithValue({ message: 'Failed to create dynamic API' });
    }
  },
);

/**
 * Regenerate API key for existing dynamic API
 */
export const regenerateApiKey = createAsyncThunk(
  'mongoApi/regenerateKey',
  async (
    { apiId, accessToken }: { apiId: string; accessToken: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await mongoFactoryApi.regenerateApiKey(
        apiId,
        accessToken,
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to regenerate API key');
    }
  },
);

/**
 * Load API session from storage (localStorage/sessionStorage)
 * Call this during app initialization to restore a saved session
 */
export const loadApiSession = createAsyncThunk(
  'mongoApi/loadSession',
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const savedSession = localStorage.getItem('mongoApiSession');
      if (!savedSession) {
        return null;
      }

      const session: DynamicApiSession = JSON.parse(savedSession);

      // Check if session is expired
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        localStorage.removeItem('mongoApiSession');
        return null;
      }

      return session;
    } catch (error) {
      return rejectWithValue('Failed to load API session');
    }
  },
);

// 🏗️ SLICE

const mongoApiSlice = createSlice({
  name: 'mongoApi',
  initialState,
  reducers: {
    /**
     * Clear the current API session
     */
    clearApiSession(state) {
      state.apiSession = null;
      state.isHydrated = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mongoApiSession');
      }
    },

    /**
     * Set API session manually (e.g., after loading from storage)
     */
    setApiSession(state, action: PayloadAction<DynamicApiSession>) {
      state.apiSession = action.payload;
      state.isHydrated = true;
    },

    /**
     * Clear creation errors
     */
    clearCreateError(state) {
      state.createError = null;
      state.createValidationErrors = null;
    },

    /**
     * Clear regenerate key error
     */
    clearRegenerateKeyError(state) {
      state.regenerateKeyError = null;
    },

    /**
     * Update API key in session (after regeneration)
     */
    updateApiKey(state, action: PayloadAction<string>) {
      if (state.apiSession) {
        state.apiSession.apiKey = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Dynamic API
      .addCase(createDynamicApi.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.createValidationErrors = null;
      })
      .addCase(createDynamicApi.fulfilled, (state, action) => {
        state.isCreating = false;
        state.apiSession = action.payload;
        state.isHydrated = true;
        // Persist to localStorage
        if (typeof window !== 'undefined' && action.payload) {
          localStorage.setItem(
            'mongoApiSession',
            JSON.stringify(action.payload),
          );
        }
      })
      .addCase(createDynamicApi.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as
          | { message?: string; errors?: ValidationError[] }
          | undefined;
        state.createError = payload?.message || 'Failed to create dynamic API';
        state.createValidationErrors = payload?.errors || null;
      })

      // Regenerate API Key
      .addCase(regenerateApiKey.pending, (state) => {
        state.isRegeneratingKey = true;
        state.regenerateKeyError = null;
      })
      .addCase(regenerateApiKey.fulfilled, (state, action) => {
        state.isRegeneratingKey = false;
        if (state.apiSession && action.payload) {
          state.apiSession.apiKey = action.payload.apiKey;
          // Update localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'mongoApiSession',
              JSON.stringify(state.apiSession),
            );
          }
        }
      })
      .addCase(regenerateApiKey.rejected, (state, action) => {
        state.isRegeneratingKey = false;
        state.regenerateKeyError =
          (action.payload as string) || 'Failed to regenerate API key';
      })

      // Load API Session
      .addCase(loadApiSession.fulfilled, (state, action) => {
        state.apiSession = action.payload;
        state.isHydrated = true;
      })
      .addCase(loadApiSession.rejected, (state) => {
        state.isHydrated = true;
      });
  },
});

export const {
  clearApiSession,
  setApiSession,
  clearCreateError,
  clearRegenerateKeyError,
  updateApiKey,
} = mongoApiSlice.actions;

export const mongoApiReducer = mongoApiSlice.reducer;

// 🔍 SELECTORS

/**
 * Get the current API session configuration for CRUD operations
 */
export const selectCrudConfig = (state: {
  mongoApi: MongoApiState;
}): CrudApiConfig | null => {
  const session = state.mongoApi.apiSession;
  if (!session) return null;

  return {
    apiId: session.apiId,
    apiKey: session.apiKey,
    baseUrl: process.env.NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL || '',
  };
};

/**
 * Check if the current API session is expired
 */
export const selectIsSessionExpired = (state: {
  mongoApi: MongoApiState;
}): boolean => {
  const session = state.mongoApi.apiSession;
  if (!session) return true;

  const expiresAt = new Date(session.expiresAt);
  return expiresAt < new Date();
};

/**
 * Get collections from current session
 */
export const selectCollections = (state: {
  mongoApi: MongoApiState;
}): string[] => {
  return state.mongoApi.apiSession?.collections || [];
};

/**
 * Get session expiration date
 */
export const selectSessionExpiresAt = (state: {
  mongoApi: MongoApiState;
}): Date | null => {
  const session = state.mongoApi.apiSession;
  if (!session) return null;
  return new Date(session.expiresAt);
};
