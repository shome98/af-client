import axios, { AxiosError, type AxiosInstance } from 'axios';

import type {
  TierListResponse,
  TierResponse,
  SubscriptionResponse,
  DiscountValidationResponse,
  RazorpayOrderResponse,
  StripeSessionResponse,
  PayPalOrderResponse,
  PaymentHistoryResponse,
  RefundListResponse,
  CreateTierPayload,
  UpdateTierPayload,
  CreateDiscountPayload,
  UpdateDiscountPayload,
  UpdateSubscriptionPayload,
  CreateRazorpayOrderPayload,
  VerifyRazorpayPaymentPayload,
  CreateStripeSessionPayload,
  CreatePayPalOrderPayload,
  RefundPayload,
  Discount,
} from '@/types/payments.types';

const PAYMENTS_API_BASE_URL = process.env.NEXT_PUBLIC_PAYMENTS_API_BASE_URL;

if (!PAYMENTS_API_BASE_URL) {
  throw new Error(
    'Missing Payments API base URL. Set NEXT_PUBLIC_PAYMENTS_API_BASE_URL.',
  );
}

const BASE = `${PAYMENTS_API_BASE_URL.replace(/\/+$/, '')}/api/v1`;

export class PaymentsApiError extends Error {
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

// Axios instance for payments API
const paymentsClient: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies for auth
});

// Response interceptor for error handling
paymentsClient.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError<{ success: boolean; message: string; errors?: unknown }>,
  ) => {
    const data = error.response?.data;
    const statusCode = error.response?.status || 500;

    throw new PaymentsApiError(
      data?.message || error.message,
      statusCode,
      (data?.errors as Array<{ path: string; message: string }>) ?? undefined,
    );
  },
);

// Public Routes

export const publicPaymentsApi = {
  /**
   * List active tiers for public display
   */
  async listTiers(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<TierListResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);

    const response = await paymentsClient.get<TierListResponse>(
      `/tiers?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get a single tier by ID
   */
  async getTier(id: string): Promise<TierResponse> {
    const response = await paymentsClient.get<TierResponse>(`/tiers/${id}`);
    return response.data;
  },

  /**
   * Get multiple tiers by IDs
   */
  async getTiersByIds(ids: string[]): Promise<TierListResponse> {
    const response = await paymentsClient.post<TierListResponse>(
      '/tiers/by-ids',
      { ids },
    );
    return response.data;
  },

  /**
   * Validate a discount code
   */
  async validateDiscount(
    code: string,
    tierId: string,
  ): Promise<DiscountValidationResponse> {
    const response = await paymentsClient.get<DiscountValidationResponse>(
      `/discounts/validate?code=${encodeURIComponent(code)}&tierId=${tierId}`,
    );
    return response.data;
  },
};

// Authenticated Routes

export const paymentsApi = {
  // Subscription

  /**
   * Get current user subscription (auto-creates free tier if none exists)
   */
  async getMySubscription(): Promise<SubscriptionResponse> {
    const response =
      await paymentsClient.get<SubscriptionResponse>('/subscriptions/me');
    return response.data;
  },

  // Razorpay

  /**
   * Create a Razorpay order
   */
  async createRazorpayOrder(
    payload: CreateRazorpayOrderPayload,
  ): Promise<RazorpayOrderResponse> {
    const response = await paymentsClient.post<RazorpayOrderResponse>(
      '/payments/razorpay/create-order',
      payload,
    );
    return response.data;
  },

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(
    payload: VerifyRazorpayPaymentPayload,
  ): Promise<{ success: boolean; message: string }> {
    const response = await paymentsClient.post<{
      success: boolean;
      message: string;
    }>('/payments/razorpay/verify', payload);
    return response.data;
  },

  /**
   * Get Razorpay payment history
   */
  async getRazorpayHistory(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaymentHistoryResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (status) params.append('status', status);

    const response = await paymentsClient.get<PaymentHistoryResponse>(
      `/payments/razorpay/history?${params.toString()}`,
    );
    return response.data;
  },

  // Stripe

  /**
   * Create a Stripe checkout session
   */
  async createStripeSession(
    payload: CreateStripeSessionPayload,
  ): Promise<StripeSessionResponse> {
    const response = await paymentsClient.post<StripeSessionResponse>(
      '/payments/stripe/create-session',
      payload,
    );
    return response.data;
  },

  /**
   * Handle Stripe success callback
   */
  async stripeSuccess(
    sessionId: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await paymentsClient.get<{
      success: boolean;
      message: string;
    }>(`/payments/stripe/success?session_id=${sessionId}`);
    return response.data;
  },

  /**
   * Handle Stripe cancel callback
   */
  async stripeCancel(): Promise<{ success: boolean; message: string }> {
    const response = await paymentsClient.get<{
      success: boolean;
      message: string;
    }>('/payments/stripe/cancel');
    return response.data;
  },

  /**
   * Get Stripe payment history
   */
  async getStripeHistory(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaymentHistoryResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (status) params.append('status', status);

    const response = await paymentsClient.get<PaymentHistoryResponse>(
      `/payments/stripe/history?${params.toString()}`,
    );
    return response.data;
  },

  // PayPal

  /**
   * Create a PayPal order
   */
  async createPayPalOrder(
    payload: CreatePayPalOrderPayload,
  ): Promise<PayPalOrderResponse> {
    const response = await paymentsClient.post<PayPalOrderResponse>(
      '/payments/paypal/create-order',
      payload,
    );
    return response.data;
  },

  /**
   * Capture PayPal payment
   */
  async capturePayPalOrder(
    orderId: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await paymentsClient.post<{
      success: boolean;
      message: string;
    }>(`/payments/paypal/capture/${orderId}`);
    return response.data;
  },

  /**
   * Get PayPal payment history
   */
  async getPayPalHistory(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaymentHistoryResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (status) params.append('status', status);

    const response = await paymentsClient.get<PaymentHistoryResponse>(
      `/payments/paypal/history?${params.toString()}`,
    );
    return response.data;
  },

  // Refunds

  /**
   * Get user refund history
   */
  async getMyRefunds(
    page = 1,
    limit = 20,
    provider?: string,
    status?: string,
  ): Promise<RefundListResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (provider) params.append('provider', provider);
    if (status) params.append('status', status);

    const response = await paymentsClient.get<RefundListResponse>(
      `/payments/refunds/me?${params.toString()}`,
    );
    return response.data;
  },
};

// Admin Routes

export const adminPaymentsApi = {
  // Tiers

  async adminListTiers(page = 1, limit = 20): Promise<TierListResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await paymentsClient.get<TierListResponse>(
      `/admin/tiers?${params.toString()}`,
    );
    return response.data;
  },

  async createTier(payload: CreateTierPayload): Promise<TierResponse> {
    const response = await paymentsClient.post<TierResponse>(
      '/admin/tiers',
      payload,
    );
    return response.data;
  },

  async updateTier(
    id: string,
    payload: UpdateTierPayload,
  ): Promise<TierResponse> {
    const response = await paymentsClient.patch<TierResponse>(
      `/admin/tiers/${id}`,
      payload,
    );
    return response.data;
  },

  async deleteTier(id: string): Promise<{ success: boolean; message: string }> {
    const response = await paymentsClient.delete<{
      success: boolean;
      message: string;
    }>(`/admin/tiers/${id}`);
    return response.data;
  },

  // Discounts

  async adminListDiscounts(): Promise<{
    success: boolean;
    message: string;
    data: Discount[];
  }> {
    const response = await paymentsClient.get<{
      success: boolean;
      message: string;
      data: Discount[];
    }>('/admin/discounts');
    return response.data;
  },

  async getDiscount(id: string): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      code: string;
      tierId: string;
      discountPercentage: string;
      isActive: boolean;
    };
  }> {
    const response = await paymentsClient.get<{
      success: boolean;
      message: string;
      data: {
        id: string;
        code: string;
        tierId: string;
        discountPercentage: string;
        isActive: boolean;
      };
    }>(`/admin/discounts/${id}`);
    return response.data;
  },

  async createDiscount(payload: CreateDiscountPayload): Promise<{
    success: boolean;
    message: string;
    data: Discount;
  }> {
    const response = await paymentsClient.post<{
      success: boolean;
      message: string;
      data: Discount;
    }>('/admin/discounts', payload);
    return response.data;
  },

  async updateDiscount(
    id: string,
    payload: UpdateDiscountPayload,
  ): Promise<{
    success: boolean;
    message: string;
    data: Discount;
  }> {
    const response = await paymentsClient.patch<{
      success: boolean;
      message: string;
      data: Discount;
    }>(`/admin/discounts/${id}`, payload);
    return response.data;
  },

  async deleteDiscount(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await paymentsClient.delete<{
      success: boolean;
      message: string;
    }>(`/admin/discounts/${id}`);
    return response.data;
  },

  // Subscriptions

  async adminListSubscriptions(
    page = 1,
    limit = 20,
  ): Promise<{
    success: boolean;
    message: string;
    data: Subscription[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await paymentsClient.get<{
      success: boolean;
      message: string;
      data: Subscription[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/subscriptions?${params.toString()}`);
    return response.data;
  },

  async adminUpdateSubscription(
    id: string,
    payload: UpdateSubscriptionPayload,
  ): Promise<SubscriptionResponse> {
    const response = await paymentsClient.patch<SubscriptionResponse>(
      `/admin/subscriptions/${id}`,
      payload,
    );
    return response.data;
  },

  // Payments

  async adminGetPayments(provider?: string): Promise<{
    success: boolean;
    message: string;
    data: Payment[] | { total: number; byProvider: Record<string, number> };
  }> {
    const params = new URLSearchParams();
    if (provider) params.append('provider', provider);

    const response = await paymentsClient.get<{
      success: boolean;
      message: string;
      data: Payment[] | { total: number; byProvider: Record<string, number> };
    }>(`/admin/payments?${params.toString()}`);
    return response.data;
  },

  // Refunds

  async processRefund(
    provider: 'razorpay' | 'stripe' | 'paypal',
    paymentId: string,
    payload: RefundPayload,
  ): Promise<{ success: boolean; message: string }> {
    const response = await paymentsClient.post<{
      success: boolean;
      message: string;
    }>(`/admin/refunds/${provider}/${paymentId}`, payload);
    return response.data;
  },
};

import type { Subscription, Payment } from '@/types/payments.types';
