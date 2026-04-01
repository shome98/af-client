'use client';

import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/lib/store/auth-store';
import { mongoApiReducer } from '@/lib/store/mongo-store';
import { registryReducer } from '@/lib/store/registry-store';
import type { User } from '@/types/auth.types';

export function createAppStore(initialUser: User | null) {
  const preloadedState = {
    auth: {
      user: initialUser,
      isAuthenticated: Boolean(initialUser),
      isHydrated: false,
      isBootstrapping: true,
      bootstrapRequestId: null,
      error: null,
      guestSession: {
        guestId: null,
        hasData: false,
        initialized: false,
      },
    },
    mongoApi: {
      apiSession: null,
      isCreating: false,
      isRegeneratingKey: false,
      createError: null,
      createValidationErrors: null,
      regenerateKeyError: null,
      isHydrated: false,
    },
    registry: {
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
    },
  };

  return configureStore({
    reducer: {
      auth: authReducer,
      mongoApi: mongoApiReducer,
      registry: registryReducer,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
