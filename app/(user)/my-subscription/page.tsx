'use client';

import { useEffect } from 'react';

import { SubscriptionCard } from '@/components/subscription/subscription-card';
import { PaymentHistory } from '@/components/subscription/payment-history';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchMySubscription } from '@/lib/store/subscription-store';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const { subscription, isLoadingSubscription, subscriptionError } =
    useAppSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchMySubscription());
  }, [dispatch]);

  useEffect(() => {
    if (subscriptionError) {
      toast.error(subscriptionError);
    }
  }, [subscriptionError]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Subscription
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription, billing, and payment history
          </p>
        </div>

        {/* Loading State */}
        {isLoadingSubscription ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : subscription ? (
          <>
            {/* Subscription Card */}
            <SubscriptionCard subscription={subscription} />

            {/* Payment History Tabs */}
            <Tabs defaultValue="razorpay" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
                <TabsTrigger value="stripe">Stripe</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
              </TabsList>
              <TabsContent value="razorpay">
                <PaymentHistory provider="razorpay" />
              </TabsContent>
              <TabsContent value="stripe">
                <PaymentHistory provider="stripe" />
              </TabsContent>
              <TabsContent value="paypal">
                <PaymentHistory provider="paypal" />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              Unable to load subscription details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
