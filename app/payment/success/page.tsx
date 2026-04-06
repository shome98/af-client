import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PUBLIC_ROUTES, USER_ROUTES } from '@/constants/routes';

type PaymentSuccessSearchParams = {
  session_id?: string | string[];
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<PaymentSuccessSearchParams>;
}) {
  const { session_id } = await searchParams;
  const sessionId = Array.isArray(session_id) ? session_id[0] : session_id;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Payment successful</CardTitle>
          <CardDescription>
            Your checkout completed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-4 text-sm">
            <div className="text-muted-foreground">Stripe session</div>
            <div className="mt-1 font-mono break-all">
              {sessionId ?? 'Missing session_id'}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={USER_ROUTES.SUBSCRIPTION}>Go to subscription</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={PUBLIC_ROUTES.HOME}>Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

