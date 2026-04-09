'use client';

import { RiCheckLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tier } from '@/types/payments.types';

interface PricingTierCardProps {
  tier: Tier;
  isCurrentPlan?: boolean;
  onSelect: (tier: Tier) => void;
  disabled?: boolean;
}

export function PricingTierCard({
  tier,
  isCurrentPlan,
  onSelect,
  disabled,
}: PricingTierCardProps) {
  const price = parseFloat(tier.price);

  return (
    <Card
      className={`flex flex-col ${isCurrentPlan ? 'border-primary ring-1 ring-primary' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{tier.name}</CardTitle>
          {isCurrentPlan && (
            <Badge variant="default" className="text-xs">
              Current Plan
            </Badge>
          )}
        </div>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">${price.toFixed(2)}</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        <div className="mb-4">
          <span className="text-sm text-muted-foreground">
            Includes <strong>{tier.limit}</strong> APIs
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            ({tier.permission} permission)
          </span>
        </div>

        <ul className="space-y-3">
          {tier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2">
              <RiCheckLine className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : 'default'}
          onClick={() => onSelect(tier)}
          disabled={disabled || isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}
