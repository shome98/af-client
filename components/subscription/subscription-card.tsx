'use client';

import Link from 'next/link';
import { RiExternalLinkLine, RiSparklingLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Subscription } from '@/types/payments.types';

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const usagePercentage =
    subscription.tier.limit > 0
      ? ((subscription.tier.limit - subscription.limitLeft) /
          subscription.tier.limit) *
        100
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Current Plan</CardTitle>
            {subscription.isSubscribed && (
              <RiSparklingLine className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <Badge
            variant={subscription.status === 'active' ? 'default' : 'secondary'}
          >
            {subscription.status}
          </Badge>
        </div>
        <CardDescription>
          Manage your subscription and billing details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{subscription.tier.name}</p>
            <p className="text-sm text-muted-foreground">
              ${parseFloat(subscription.tier.price).toFixed(2)}/month
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/pricing">
              Change Plan
              <RiExternalLinkLine className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Usage Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">API Usage</span>
            <span className="font-medium">
              {subscription.tier.limit - subscription.limitLeft} of{' '}
              {subscription.tier.limit} APIs used
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {subscription.limitLeft} APIs remaining
          </p>
        </div>

        {/* Plan Details */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Permission Level</span>
            <span className="font-medium">{subscription.tier.permission}</span>
          </div>
          {subscription.expiresAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Renews On</span>
              <span className="font-medium">
                {new Date(subscription.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
          {subscription.autoRenew && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Auto-renew</span>
              <span className="font-medium text-green-600">Enabled</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
