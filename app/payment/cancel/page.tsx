import { redirect } from 'next/navigation';

import { USER_ROUTES } from '@/constants/routes';

type PaymentCancelSearchParams = {
  tierId?: string | string[];
  discountCode?: string | string[];
};

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<PaymentCancelSearchParams>;
}) {
  const { tierId, discountCode } = await searchParams;

  const params = new URLSearchParams();
  const tierIdValue = first(tierId);
  const discountCodeValue = first(discountCode);

  if (tierIdValue) params.set('tierId', tierIdValue);
  if (discountCodeValue) params.set('discountCode', discountCodeValue);

  const destination = params.size
    ? `${USER_ROUTES.SUBSCRIPTION_CHECKOUT}?${params.toString()}`
    : USER_ROUTES.SUBSCRIPTION_CHECKOUT;

  redirect(destination);
}

