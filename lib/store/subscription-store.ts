'use client';

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import {
  publicPaymentsApi,
  paymentsApi,
  adminPaymentsApi,
  PaymentsApiError,
} from '@/lib/actions/payments-api';
import type {
  Tier,
  Subscription,
  Payment,
  Refund,
  Discount,
  CreateRazorpayOrderPayload,
  VerifyRazorpayPaymentPayload,
  CreateStripeSessionPayload,
  CreatePayPalOrderPayload,
  CreateTierPayload,
  UpdateTierPayload,
  CreateDiscountPayload,
  UpdateDiscountPayload,
  UpdateSubscriptionPayload,
  RefundPayload,
  PaymentsState,
} from '@/types/payments.types';

const initialState: PaymentsState = {
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
};

// Public Thunks

export const fetchTiers = createAsyncThunk(
  'payments/fetchTiers',
  async (
    {
      page = 1,
      limit = 20,
      search,
    }: { page?: number; limit?: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await publicPaymentsApi.listTiers(page, limit, search);
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch tiers');
    }
  },
);

export const fetchTierById = createAsyncThunk(
  'payments/fetchTierById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await publicPaymentsApi.getTier(id);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch tier');
    }
  },
);

export const validateDiscountCode = createAsyncThunk(
  'payments/validateDiscountCode',
  async (
    { code, tierId }: { code: string; tierId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await publicPaymentsApi.validateDiscount(code, tierId);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to validate discount code');
    }
  },
);

// Authenticated Thunks

export const fetchMySubscription = createAsyncThunk(
  'payments/fetchMySubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getMySubscription();
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch subscription');
    }
  },
);

// Razorpay

export const createRazorpayOrder = createAsyncThunk(
  'payments/createRazorpayOrder',
  async (payload: CreateRazorpayOrderPayload, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.createRazorpayOrder(payload);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create order');
    }
  },
);

export const verifyRazorpayPayment = createAsyncThunk(
  'payments/verifyRazorpayPayment',
  async (payload: VerifyRazorpayPaymentPayload, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.verifyRazorpayPayment(payload);
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to verify payment');
    }
  },
);

// Stripe

export const createStripeSession = createAsyncThunk(
  'payments/createStripeSession',
  async (payload: CreateStripeSessionPayload, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.createStripeSession(payload);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create session');
    }
  },
);

export const handleStripeSuccess = createAsyncThunk(
  'payments/handleStripeSuccess',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.stripeSuccess(sessionId);
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to process payment');
    }
  },
);

// PayPal

export const createPayPalOrder = createAsyncThunk(
  'payments/createPayPalOrder',
  async (payload: CreatePayPalOrderPayload, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.createPayPalOrder(payload);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create order');
    }
  },
);

export const capturePayPalOrder = createAsyncThunk(
  'payments/capturePayPalOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.capturePayPalOrder(orderId);
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to capture payment');
    }
  },
);

// Payment History

export const fetchPaymentHistory = createAsyncThunk(
  'payments/fetchPaymentHistory',
  async (
    {
      provider,
      page = 1,
      limit = 20,
    }: {
      provider: 'razorpay' | 'stripe' | 'paypal';
      page?: number;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      let response;
      switch (provider) {
        case 'razorpay':
          response = await paymentsApi.getRazorpayHistory(page, limit);
          break;
        case 'stripe':
          response = await paymentsApi.getStripeHistory(page, limit);
          break;
        case 'paypal':
          response = await paymentsApi.getPayPalHistory(page, limit);
          break;
      }
      return { provider, data: response.data };
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch payment history');
    }
  },
);

// Refunds

export const fetchMyRefunds = createAsyncThunk(
  'payments/fetchMyRefunds',
  async (
    { page = 1, limit = 20 }: { page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await paymentsApi.getMyRefunds(page, limit);
      return response.data.refunds;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch refunds');
    }
  },
);

// Admin Thunks

export const adminFetchTiers = createAsyncThunk(
  'payments/adminFetchTiers',
  async (
    { page = 1, limit = 20 }: { page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminPaymentsApi.adminListTiers(page, limit);
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch tiers');
    }
  },
);

export const adminCreateTier = createAsyncThunk(
  'payments/adminCreateTier',
  async (payload: CreateTierPayload, { rejectWithValue }) => {
    try {
      const response = await adminPaymentsApi.createTier(payload);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create tier');
    }
  },
);

export const adminUpdateTier = createAsyncThunk(
  'payments/adminUpdateTier',
  async (
    { id, payload }: { id: string; payload: UpdateTierPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminPaymentsApi.updateTier(id, payload);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update tier');
    }
  },
);

export const adminDeleteTier = createAsyncThunk(
  'payments/adminDeleteTier',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminPaymentsApi.deleteTier(id);
      return id;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete tier');
    }
  },
);

export const adminFetchDiscounts = createAsyncThunk(
  'payments/adminFetchDiscounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminPaymentsApi.adminListDiscounts();
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch discounts');
    }
  },
);

export const adminCreateDiscount = createAsyncThunk(
  'payments/adminCreateDiscount',
  async (payload: CreateDiscountPayload, { rejectWithValue }) => {
    try {
      const response = await adminPaymentsApi.createDiscount(payload);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create discount');
    }
  },
);

export const adminUpdateDiscount = createAsyncThunk(
  'payments/adminUpdateDiscount',
  async (
    { id, payload }: { id: string; payload: UpdateDiscountPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminPaymentsApi.updateDiscount(id, payload);
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update discount');
    }
  },
);

export const adminDeleteDiscount = createAsyncThunk(
  'payments/adminDeleteDiscount',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminPaymentsApi.deleteDiscount(id);
      return id;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete discount');
    }
  },
);

export const adminFetchSubscriptions = createAsyncThunk(
  'payments/adminFetchSubscriptions',
  async (
    { page = 1, limit = 20 }: { page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminPaymentsApi.adminListSubscriptions(
        page,
        limit,
      );
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch subscriptions');
    }
  },
);

export const adminUpdateSubscription = createAsyncThunk(
  'payments/adminUpdateSubscription',
  async (
    { id, payload }: { id: string; payload: UpdateSubscriptionPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminPaymentsApi.adminUpdateSubscription(
        id,
        payload,
      );
      return response.data;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update subscription');
    }
  },
);

// Admin: Fetch Payments
export const adminFetchPayments = createAsyncThunk(
  'payments/adminFetchPayments',
  async (
    {
      provider,
      page = 1,
      limit = 20,
    }: { provider?: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminPaymentsApi.adminGetPayments(provider);
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch payments');
    }
  },
);

// Admin: Process Refund
export const adminProcessRefund = createAsyncThunk(
  'payments/adminProcessRefund',
  async (
    {
      provider,
      paymentId,
      payload,
    }: {
      provider: 'razorpay' | 'stripe' | 'paypal';
      paymentId: string;
      payload?: { amount?: number; reason?: string; notes?: string };
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminPaymentsApi.processRefund(
        provider,
        paymentId,
        payload || {},
      );
      return response;
    } catch (error) {
      if (error instanceof PaymentsApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to process refund');
    }
  },
);

// Slice

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearSelectedTier(state) {
      state.selectedTier = null;
    },
    clearValidatedDiscount(state) {
      state.validatedDiscount = null;
      state.discountFinalPrice = null;
    },
    clearErrors(state) {
      state.error = null;
      state.tierError = null;
      state.subscriptionError = null;
      state.paymentError = null;
      state.discountError = null;
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tiers
      .addCase(fetchTiers.pending, (state) => {
        state.isLoadingTiers = true;
        state.tierError = null;
      })
      .addCase(fetchTiers.fulfilled, (state, action) => {
        state.isLoadingTiers = false;
        state.tiers = action.payload.data;
      })
      .addCase(fetchTiers.rejected, (state, action) => {
        state.isLoadingTiers = false;
        state.tierError = (action.payload as string) || 'Failed to fetch tiers';
      })

      // Fetch Tier by ID
      .addCase(fetchTierById.pending, (state) => {
        state.isLoadingTiers = true;
        state.tierError = null;
      })
      .addCase(fetchTierById.fulfilled, (state, action) => {
        state.isLoadingTiers = false;
        state.selectedTier = action.payload;
      })
      .addCase(fetchTierById.rejected, (state, action) => {
        state.isLoadingTiers = false;
        state.tierError = (action.payload as string) || 'Failed to fetch tier';
      })

      // Validate Discount
      .addCase(validateDiscountCode.pending, (state) => {
        state.isValidatingDiscount = true;
        state.discountError = null;
      })
      .addCase(validateDiscountCode.fulfilled, (state, action) => {
        state.isValidatingDiscount = false;
        state.validatedDiscount = action.payload.discount;
        state.discountFinalPrice = action.payload.finalPrice;
      })
      .addCase(validateDiscountCode.rejected, (state, action) => {
        state.isValidatingDiscount = false;
        state.discountError =
          (action.payload as string) || 'Invalid discount code';
        state.validatedDiscount = null;
        state.discountFinalPrice = null;
      })

      // Fetch My Subscription
      .addCase(fetchMySubscription.pending, (state) => {
        state.isLoadingSubscription = true;
        state.subscriptionError = null;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.isLoadingSubscription = false;
        state.subscription = action.payload;
      })
      .addCase(fetchMySubscription.rejected, (state, action) => {
        state.isLoadingSubscription = false;
        state.subscriptionError =
          (action.payload as string) || 'Failed to fetch subscription';
      })

      // Create Razorpay Order
      .addCase(createRazorpayOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.paymentError = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state) => {
        state.isCreatingOrder = false;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.paymentError =
          (action.payload as string) || 'Failed to create order';
      })

      // Verify Razorpay Payment
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.isVerifyingPayment = true;
        state.paymentError = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state) => {
        state.isVerifyingPayment = false;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.isVerifyingPayment = false;
        state.paymentError =
          (action.payload as string) || 'Failed to verify payment';
      })

      // Create Stripe Session
      .addCase(createStripeSession.pending, (state) => {
        state.isCreatingOrder = true;
        state.paymentError = null;
      })
      .addCase(createStripeSession.fulfilled, (state) => {
        state.isCreatingOrder = false;
      })
      .addCase(createStripeSession.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.paymentError =
          (action.payload as string) || 'Failed to create session';
      })

      // Create PayPal Order
      .addCase(createPayPalOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.paymentError = null;
      })
      .addCase(createPayPalOrder.fulfilled, (state) => {
        state.isCreatingOrder = false;
      })
      .addCase(createPayPalOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.paymentError =
          (action.payload as string) || 'Failed to create order';
      })

      // Admin: Fetch Tiers
      .addCase(adminFetchTiers.pending, (state) => {
        state.isLoadingTiers = true;
        state.adminError = null;
      })
      .addCase(adminFetchTiers.fulfilled, (state, action) => {
        state.isLoadingTiers = false;
        state.tiers = action.payload.data;
      })
      .addCase(adminFetchTiers.rejected, (state, action) => {
        state.isLoadingTiers = false;
        state.adminError =
          (action.payload as string) || 'Failed to fetch tiers';
      })

      // Admin: Create Tier
      .addCase(adminCreateTier.pending, (state) => {
        state.isCreatingTier = true;
        state.adminError = null;
      })
      .addCase(adminCreateTier.fulfilled, (state, action) => {
        state.isCreatingTier = false;
        state.tiers.push(action.payload);
      })
      .addCase(adminCreateTier.rejected, (state, action) => {
        state.isCreatingTier = false;
        state.adminError =
          (action.payload as string) || 'Failed to create tier';
      })

      // Admin: Update Tier
      .addCase(adminUpdateTier.pending, (state) => {
        state.isUpdatingTier = true;
        state.adminError = null;
      })
      .addCase(adminUpdateTier.fulfilled, (state, action) => {
        state.isUpdatingTier = false;
        const index = state.tiers.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tiers[index] = action.payload;
        }
      })
      .addCase(adminUpdateTier.rejected, (state, action) => {
        state.isUpdatingTier = false;
        state.adminError =
          (action.payload as string) || 'Failed to update tier';
      })

      // Admin: Delete Tier
      .addCase(adminDeleteTier.pending, (state) => {
        state.isDeletingTier = true;
        state.adminError = null;
      })
      .addCase(adminDeleteTier.fulfilled, (state, action) => {
        state.isDeletingTier = false;
        state.tiers = state.tiers.filter((t) => t.id !== action.payload);
      })
      .addCase(adminDeleteTier.rejected, (state, action) => {
        state.isDeletingTier = false;
        state.adminError =
          (action.payload as string) || 'Failed to delete tier';
      })

      // Admin: Fetch Discounts
      .addCase(adminFetchDiscounts.pending, (state) => {
        state.isLoadingDiscounts = true;
        state.adminError = null;
      })
      .addCase(adminFetchDiscounts.fulfilled, (state, action) => {
        state.isLoadingDiscounts = false;
        state.discounts = action.payload;
      })
      .addCase(adminFetchDiscounts.rejected, (state, action) => {
        state.isLoadingDiscounts = false;
        state.adminError =
          (action.payload as string) || 'Failed to fetch discounts';
      })

      // Admin: Create Discount
      .addCase(adminCreateDiscount.pending, (state) => {
        state.isCreatingDiscount = true;
        state.adminError = null;
      })
      .addCase(adminCreateDiscount.fulfilled, (state, action) => {
        state.isCreatingDiscount = false;
        state.discounts.push(action.payload);
      })
      .addCase(adminCreateDiscount.rejected, (state, action) => {
        state.isCreatingDiscount = false;
        state.adminError =
          (action.payload as string) || 'Failed to create discount';
      })

      // Admin: Update Discount
      .addCase(adminUpdateDiscount.pending, (state) => {
        state.isUpdatingDiscount = true;
        state.adminError = null;
      })
      .addCase(adminUpdateDiscount.fulfilled, (state, action) => {
        state.isUpdatingDiscount = false;
        const index = state.discounts.findIndex(
          (d) => d.id === action.payload.id,
        );
        if (index !== -1) {
          state.discounts[index] = action.payload;
        }
      })
      .addCase(adminUpdateDiscount.rejected, (state, action) => {
        state.isUpdatingDiscount = false;
        state.adminError =
          (action.payload as string) || 'Failed to update discount';
      })

      // Admin: Delete Discount
      .addCase(adminDeleteDiscount.pending, (state) => {
        state.isDeletingDiscount = true;
        state.adminError = null;
      })
      .addCase(adminDeleteDiscount.fulfilled, (state, action) => {
        state.isDeletingDiscount = false;
        state.discounts = state.discounts.filter(
          (d) => d.id !== action.payload,
        );
      })
      .addCase(adminDeleteDiscount.rejected, (state, action) => {
        state.isDeletingDiscount = false;
        state.adminError =
          (action.payload as string) || 'Failed to delete discount';
      })

      // Admin: Fetch Subscriptions
      .addCase(adminFetchSubscriptions.pending, (state) => {
        state.isLoadingSubscriptions = true;
        state.adminError = null;
      })
      .addCase(adminFetchSubscriptions.fulfilled, (state, action) => {
        state.isLoadingSubscriptions = false;
        state.subscriptions = action.payload.data;
      })
      .addCase(adminFetchSubscriptions.rejected, (state, action) => {
        state.isLoadingSubscriptions = false;
        state.adminError =
          (action.payload as string) || 'Failed to fetch subscriptions';
      })

      // Admin: Update Subscription
      .addCase(adminUpdateSubscription.pending, (state) => {
        state.isUpdatingSubscription = true;
        state.adminError = null;
      })
      .addCase(adminUpdateSubscription.fulfilled, (state, action) => {
        state.isUpdatingSubscription = false;
        const index = state.subscriptions.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(adminUpdateSubscription.rejected, (state, action) => {
        state.isUpdatingSubscription = false;
        state.adminError =
          (action.payload as string) || 'Failed to update subscription';
      })

      // Admin: Fetch Payments
      .addCase(adminFetchPayments.pending, (state) => {
        state.isLoadingPayments = true;
        state.adminError = null;
      })
      .addCase(adminFetchPayments.fulfilled, (state, action) => {
        state.isLoadingPayments = false;
        // Check if response is Payment[] or summary object
        if (Array.isArray(action.payload.data)) {
          state.payments = action.payload.data;
        } else {
          // It's a summary object, keep payments empty
          state.payments = [];
        }
      })
      .addCase(adminFetchPayments.rejected, (state, action) => {
        state.isLoadingPayments = false;
        state.adminError =
          (action.payload as string) || 'Failed to fetch payments';
      })

      // Admin: Process Refund
      .addCase(adminProcessRefund.pending, (state) => {
        state.isProcessingRefund = true;
        state.adminError = null;
      })
      .addCase(adminProcessRefund.fulfilled, (state) => {
        state.isProcessingRefund = false;
      })
      .addCase(adminProcessRefund.rejected, (state, action) => {
        state.isProcessingRefund = false;
        state.adminError =
          (action.payload as string) || 'Failed to process refund';
      });
  },
});

export const { clearSelectedTier, clearValidatedDiscount, clearErrors } =
  paymentsSlice.actions;

// Export admin thunks with cleaner names
export {
  adminFetchTiers as fetchAllTiersAdmin,
  adminCreateTier as createTierAdmin,
  adminUpdateTier as updateTierAdmin,
  adminDeleteTier as deleteTierAdmin,
  adminFetchDiscounts as fetchAllDiscountsAdmin,
  adminCreateDiscount as createDiscountAdmin,
  adminUpdateDiscount as updateDiscountAdmin,
  adminDeleteDiscount as deleteDiscountAdmin,
  adminFetchSubscriptions as fetchAllSubscriptionsAdmin,
  adminUpdateSubscription as updateSubscriptionAdmin,
  adminFetchPayments as fetchAllPaymentsAdmin,
  adminProcessRefund as processRefundAdmin,
};

export const paymentsReducer = paymentsSlice.reducer;

// Selectors

export const selectTiers = (state: { payments: PaymentsState }) =>
  state.payments.tiers;

export const selectSelectedTier = (state: { payments: PaymentsState }) =>
  state.payments.selectedTier;

export const selectSubscription = (state: { payments: PaymentsState }) =>
  state.payments.subscription;

export const selectPayments = (state: { payments: PaymentsState }) =>
  state.payments.payments;

export const selectRefunds = (state: { payments: PaymentsState }) =>
  state.payments.refunds;

export const selectValidatedDiscount = (state: { payments: PaymentsState }) =>
  state.payments.validatedDiscount;

export const selectDiscountFinalPrice = (state: { payments: PaymentsState }) =>
  state.payments.discountFinalPrice;

export const selectIsLoadingTiers = (state: { payments: PaymentsState }) =>
  state.payments.isLoadingTiers;

export const selectIsLoadingSubscription = (state: {
  payments: PaymentsState;
}) => state.payments.isLoadingSubscription;

export const selectIsCreatingOrder = (state: { payments: PaymentsState }) =>
  state.payments.isCreatingOrder;

export const selectPaymentsError = (state: { payments: PaymentsState }) =>
  state.payments.error;
