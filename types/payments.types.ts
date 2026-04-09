// Payments & Subscriptions API Types

import type { PermissionType } from './mongo.types';

export interface Tier {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  price: string;
  limit: number;
  permission: PermissionType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  tierId: string;
  code: string;
  discountPercentage: string;
  finalPrice: string;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  isSubscribed: boolean;
  tierId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  expiresAt: string | null;
  limitLeft: number;
  autoRenew: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  tier: Tier;
}

export interface Payment {
  id: string;
  userId: string;
  tierId: string;
  status:
    | 'pending'
    | 'completed'
    | 'failed'
    | 'refunded'
    | 'captured'
    | 'succeeded';
  amount: number | string;
  currency: string;
  provider: 'razorpay' | 'stripe' | 'paypal';
  providerOrderId?: string;
  providerPaymentId?: string;
  discountId?: string;
  tier?: Tier;
  createdAt: string;
  updatedAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  userId: string;
  amount: number | string;
  currency: string;
  status: 'pending' | 'processed' | 'failed';
  reason?: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
}

export interface TierListResponse {
  success: boolean;
  message: string;
  data: Tier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TierResponse {
  success: boolean;
  message: string;
  data: Tier;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: Subscription;
}

export interface DiscountValidationResponse {
  success: boolean;
  message: string;
  data: {
    discount: Discount;
    finalPrice: string;
    originalPrice: string;
  };
}

export interface RazorpayOrderResponse {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    razorpayOrder: {
      id: string;
    };
  };
}

export interface StripeSessionResponse {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    sessionUrl: string;
  };
}

export interface PayPalOrderResponse {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    approvalUrl: string;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RefundListResponse {
  success: boolean;
  message: string;
  data: {
    refunds: Refund[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface CreateTierPayload {
  name: string;
  description: string;
  benefits: string[];
  price: number;
  limit: number;
  permission: PermissionType;
  isActive?: boolean;
}

export interface UpdateTierPayload {
  name?: string;
  description?: string;
  benefits?: string[];
  price?: number;
  limit?: number;
  permission?: PermissionType;
  isActive?: boolean;
}

export interface CreateDiscountPayload {
  tierId: string;
  code: string;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  isActive?: boolean;
}

export interface UpdateDiscountPayload {
  tierId?: string;
  code?: string;
  discountPercentage?: number;
  validFrom?: string;
  validUntil?: string;
  maxUses?: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionPayload {
  tierId?: string;
  isSubscribed?: boolean;
  status?: string;
  expiresAt?: string;
  autoRenew?: boolean;
  limitLeft?: number;
}

export interface CreateRazorpayOrderPayload {
  tierId: string;
  discountCode?: string;
  currency?: string;
  notes?: Record<string, unknown>;
}

export interface VerifyRazorpayPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface CreateStripeSessionPayload {
  tierId: string;
  discountCode?: string;
  currency?: string;
}

export interface CreatePayPalOrderPayload {
  tierId: string;
  discountCode?: string;
  currency?: string;
}

export interface RefundPayload {
  amount?: number;
  reason?: string;
  notes?: string;
}

export interface PaymentsState {
  // Tiers
  tiers: Tier[];
  selectedTier: Tier | null;
  // Subscription
  subscription: Subscription | null;
  // Payments
  payments: Payment[];
  // Refunds
  refunds: Refund[];
  // Discounts
  discounts: Discount[];
  validatedDiscount: Discount | null;
  discountFinalPrice: string | null;
  // Subscriptions (admin)
  subscriptions: Subscription[];
  // Loading states
  isLoadingTiers: boolean;
  isLoadingSubscription: boolean;
  isCreatingOrder: boolean;
  isVerifyingPayment: boolean;
  isLoadingPayments: boolean;
  isLoadingRefunds: boolean;
  isValidatingDiscount: boolean;
  isLoadingDiscounts: boolean;
  isLoadingSubscriptions: boolean;
  // Admin loading states
  isCreatingTier: boolean;
  isUpdatingTier: boolean;
  isDeletingTier: boolean;
  isCreatingDiscount: boolean;
  isUpdatingDiscount: boolean;
  isDeletingDiscount: boolean;
  isUpdatingSubscription: boolean;
  isProcessingRefund: boolean;
  // Errors
  error: string | null;
  tierError: string | null;
  subscriptionError: string | null;
  paymentError: string | null;
  discountError: string | null;
  adminError: string | null;
}
