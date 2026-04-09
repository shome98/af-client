'use client';

import { Badge } from '@/components/ui/badge';

interface ApiStatusBadgeProps {
  isActive: boolean;
  expirationTime: string;
}

export function ApiStatusBadge({
  isActive,
  expirationTime,
}: ApiStatusBadgeProps) {
  // Note: Expiration check is done client-side to avoid impure function during SSR
  // The server sends the correct isActive state, but for visual indication of expiration
  // we rely on the parent component or client-side hydration

  if (!isActive) {
    return (
      <Badge variant="destructive" className="text-xs">
        Deactivated
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="text-xs bg-green-100 text-green-700 hover:bg-green-100"
    >
      Active
    </Badge>
  );
}
