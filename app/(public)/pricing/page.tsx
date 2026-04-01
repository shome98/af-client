'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiSparklingLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PricingTierCard } from '@/components/payments/pricing-tier-card';
import { DiscountCodeInput } from '@/components/payments/discount-code-input';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchTiers,
  fetchMySubscription,
  validateDiscountCode,
  clearValidatedDiscount,
  clearErrors,
} from '@/lib/store/subscription-store';
import { toast } from 'sonner';
import type { Tier } from '@/types/payments.types';

export default function PricingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    tiers,
    subscription,
    validatedDiscount,
    discountFinalPrice,
    isLoadingTiers,
    isLoadingSubscription,
    isValidatingDiscount,
    discountError,
  } = useAppSelector((state) => state.payments);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  useEffect(() => {
    dispatch(fetchTiers({}));
    if (isAuthenticated) {
      dispatch(fetchMySubscription());
    }

    return () => {
      dispatch(clearValidatedDiscount());
      dispatch(clearErrors());
    };
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (discountError) {
      toast.error(discountError);
      dispatch(clearErrors());
    }
  }, [discountError, dispatch]);

  const handleSelectTier = (tier: Tier) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setSelectedTier(tier);

    // Clear any previous discount when changing tiers
    dispatch(clearValidatedDiscount());
  };

  const handleApplyDiscount = (code: string) => {
    if (selectedTier) {
      dispatch(validateDiscountCode({ code, tierId: selectedTier.id }));
    } else {
      toast.error('Please select a plan first');
    }
  };

  const handleRemoveDiscount = () => {
    dispatch(clearValidatedDiscount());
  };

  const handleContinue = () => {
    if (!selectedTier) {
      toast.error('Please select a plan');
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('tierId', selectedTier.id);
    if (validatedDiscount) {
      queryParams.append('discountCode', validatedDiscount.code);
    }

    router.push(`/dashboard/subscription/checkout?${queryParams.toString()}`);
  };

  const isLoading = isLoadingTiers || isLoadingSubscription;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include access to
            the API factory with varying limits and features.
          </p>
        </div>

        {/* Current Plan Banner */}
        {subscription && (
          <div className="mb-8">
            <Alert className="bg-primary/5 border-primary/20">
              <RiSparklingLine className="h-4 w-4 text-primary" />
              <AlertDescription>
                You are currently on the{' '}
                <strong>{subscription.tier.name}</strong> plan with{' '}
                <strong>{subscription.limitLeft}</strong> APIs remaining.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => (
            <PricingTierCard
              key={tier.id}
              tier={tier}
              isCurrentPlan={subscription?.tierId === tier.id}
              onSelect={handleSelectTier}
              disabled={!tier.isActive}
            />
          ))}
        </div>

        {/* Discount Code & Checkout */}
        {selectedTier && (
          <div className="max-w-md mx-auto p-6 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">
              Selected Plan: {selectedTier.name}
            </h3>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Original Price</span>
                <span>${parseFloat(selectedTier.price).toFixed(2)}/month</span>
              </div>
              {validatedDiscount && discountFinalPrice && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">
                    -$
                    {(
                      parseFloat(selectedTier.price) -
                      parseFloat(discountFinalPrice)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>
                  $
                  {validatedDiscount && discountFinalPrice
                    ? parseFloat(discountFinalPrice).toFixed(2)
                    : parseFloat(selectedTier.price).toFixed(2)}
                  /month
                </span>
              </div>
            </div>

            <div className="mb-4">
              <DiscountCodeInput
                onApply={handleApplyDiscount}
                onRemove={handleRemoveDiscount}
                isValidating={isValidatingDiscount}
                isValid={!!validatedDiscount}
                discountAmount={validatedDiscount?.discountPercentage}
                error={discountError}
              />
            </div>

            <Button className="w-full" onClick={handleContinue}>
              Continue to Checkout
            </Button>
          </div>
        )}

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Need a custom plan?{' '}
            <a
              href="mailto:support@example.com"
              className="text-primary hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
