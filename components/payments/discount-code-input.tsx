'use client';

import { useState } from 'react';
import { RiCouponLine, RiCheckLine, RiCloseLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface DiscountCodeInputProps {
  onApply: (code: string) => void;
  onRemove: () => void;
  isValidating: boolean;
  isValid: boolean;
  discountAmount?: string;
  error?: string | null;
}

export function DiscountCodeInput({
  onApply,
  onRemove,
  isValidating,
  isValid,
  discountAmount,
  error,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  if (isValid) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <RiCheckLine className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <span className="text-sm font-medium text-green-800">
            Code applied: {discountAmount}% off
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-green-700 hover:text-green-900 hover:bg-green-100"
        >
          <RiCloseLine className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <RiCouponLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 uppercase"
            disabled={isValidating}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
          variant="outline"
        >
          {isValidating ? <Spinner className="h-4 w-4" /> : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
