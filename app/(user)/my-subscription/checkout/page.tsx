'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RiArrowLeftLine, RiBankCardLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProtectedGuard } from '@/components/auth/auth-guard';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchTierById,
  validateDiscountCode,
  createRazorpayOrder,
  createStripeSession,
  createPayPalOrder,
  clearValidatedDiscount,
  clearErrors,
} from '@/lib/store/subscription-store';
import { toast } from 'sonner';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const tierId = searchParams.get('tierId');
  const discountCode = searchParams.get('discountCode');

  const {
    selectedTier,
    validatedDiscount,
    discountFinalPrice,
    isLoadingTiers,
    isCreatingOrder,
    isValidatingDiscount,
    discountError,
    paymentError,
  } = useAppSelector((state) => state.payments);

  const [selectedProvider, setSelectedProvider] = useState<
    'razorpay' | 'stripe' | 'paypal'
  >('stripe');

  useEffect(() => {
    if (!tierId) {
      router.push('/pricing');
      return;
    }

    dispatch(fetchTierById(tierId));

    if (discountCode) {
      dispatch(validateDiscountCode({ code: discountCode, tierId }));
    }

    return () => {
      dispatch(clearValidatedDiscount());
      dispatch(clearErrors());
    };
  }, [dispatch, tierId, discountCode, router]);

  useEffect(() => {
    if (discountError) {
      toast.error(discountError);
      dispatch(clearErrors());
    }
    if (paymentError) {
      toast.error(paymentError);
      dispatch(clearErrors());
    }
  }, [discountError, paymentError, dispatch]);

  const handlePayment = async () => {
    if (!tierId || !selectedTier) return;

    const payload = {
      tierId,
      discountCode: validatedDiscount?.code || undefined,
      currency: selectedProvider === 'razorpay' ? 'INR' : 'USD',
    };

    switch (selectedProvider) {
      case 'razorpay': {
        const result = await dispatch(createRazorpayOrder(payload));
        if (createRazorpayOrder.fulfilled.match(result)) {
          // Load Razorpay checkout
          const { razorpayOrder } = result.payload;
          // In a real implementation, you would load the Razorpay SDK here
          toast.success('Razorpay order created: ' + razorpayOrder.id);
        }
        break;
      }
      case 'stripe': {
        const result = await dispatch(createStripeSession(payload));
        if (createStripeSession.fulfilled.match(result)) {
          // Redirect to Stripe checkout
          window.location.href = result.payload.sessionUrl;
        }
        break;
      }
      case 'paypal': {
        const result = await dispatch(createPayPalOrder(payload));
        if (createPayPalOrder.fulfilled.match(result)) {
          // Redirect to PayPal
          window.location.href = result.payload.approvalUrl;
        }
        break;
      }
    }
  };

  if (isLoadingTiers || !selectedTier) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const originalPrice = parseFloat(selectedTier.price);
  const finalPrice =
    validatedDiscount && discountFinalPrice
      ? parseFloat(discountFinalPrice)
      : originalPrice;
  const discount = originalPrice - finalPrice;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/pricing')}
        >
          <RiArrowLeftLine className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Complete your subscription purchase
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review your subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{selectedTier.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Billing</span>
            <span className="font-medium">Monthly</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Original Price</span>
            <span>${originalPrice.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-4 border-t flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Select your preferred payment provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={selectedProvider === 'razorpay' ? 'default' : 'outline'}
              onClick={() => setSelectedProvider('razorpay')}
              className="h-auto py-4"
              disabled
            >
              <div className="text-center">
                <RiBankCardLine className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Razorpay</span>
                <span className="block text-xs text-muted-foreground">INR</span>
              </div>
            </Button>
            <Button
              variant={selectedProvider === 'stripe' ? 'default' : 'outline'}
              onClick={() => setSelectedProvider('stripe')}
              className="h-auto py-4"
            >
              <div className="text-center">
                <RiBankCardLine className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Stripe</span>
                <span className="block text-xs text-muted-foreground">USD</span>
              </div>
            </Button>
            <Button
              variant={selectedProvider === 'paypal' ? 'default' : 'outline'}
              onClick={() => setSelectedProvider('paypal')}
              className="h-auto py-4"
              disabled
            >
              <div className="text-center">
                <RiBankCardLine className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">PayPal</span>
                <span className="block text-xs text-muted-foreground">USD</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handlePayment}
        disabled={isCreatingOrder || isValidatingDiscount}
      >
        {isCreatingOrder ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Processing...
          </>
        ) : (
          `Pay $${finalPrice.toFixed(2)}`
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        You will be redirected to {selectedProvider} to complete your payment
        securely.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedGuard>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </div>
    </ProtectedGuard>
  );
}
