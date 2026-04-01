'use client';

import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/lib/store/auth-store';
import { mongoApiReducer } from '@/lib/store/mongo-store';
import { registryReducer } from '@/lib/store/registry-store';
import { paymentsReducer } from '@/lib/store/subscription-store';
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
    payments: {
      tiers: [],
      selectedTier: null,
      subscription: null,
      payments: [],
      refunds: [],
      discounts: [],
      validatedDiscount: null,
      discountFinalPrice: null,
      subscriptions: [],
      isLoadingTiers: false,
      isLoadingSubscription: false,
      isCreatingOrder: false,
      isVerifyingPayment: false,
      isLoadingPayments: false,
      isLoadingRefunds: false,
      isValidatingDiscount: false,
      isLoadingDiscounts: false,
      isLoadingSubscriptions: false,
      isCreatingTier: false,
      isUpdatingTier: false,
      isDeletingTier: false,
      isCreatingDiscount: false,
      isUpdatingDiscount: false,
      isDeletingDiscount: false,
      isUpdatingSubscription: false,
      isProcessingRefund: false,
      error: null,
      tierError: null,
      subscriptionError: null,
      paymentError: null,
      discountError: null,
      adminError: null,
    },
  };

  return configureStore({
    reducer: {
      auth: authReducer,
      mongoApi: mongoApiReducer,
      registry: registryReducer,
      payments: paymentsReducer,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
