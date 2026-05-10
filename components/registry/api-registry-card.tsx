'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import {
  RiMoreLine,
  RiFileCopyLine,
  RiKey2Line,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiStatusBadge } from './api-status-badge';
import type { ApiRegistryItem } from '@/types/registry.types';

interface ApiRegistryCardProps {
  api: ApiRegistryItem;
  onRegenerateKey: (id: string) => void;
  onSoftDelete: (id: string) => void;
  onCopyApiId: (apiId: string) => void;
}

type Listener = () => void;

// Time store for React 19: getSnapshot must be stable until subscribe notifies.
let clientNow = Date.now();
const serverNow = Date.now();
const listeners = new Set<Listener>();
let interval: ReturnType<typeof setInterval> | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function tick() {
  clientNow = Date.now();
  emit();
}

function ensureInterval() {
  if (interval) return;
  interval = setInterval(tick, 60_000);
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  ensureInterval();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval) {
      clearInterval(interval);
      interval = null;
    }
  };
}

function getSnapshot() {
  return clientNow;
}

function getServerSnapshot() {
  return serverNow;
}

// Helper to get expiration info - safe for React 19 render purity
function useExpirationInfo(expirationTime: string) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const expirationDate = new Date(expirationTime);
  const formattedDate = expirationDate.toLocaleDateString();
  const isExpired = now > expirationDate.getTime();
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - now) / (1000 * 60 * 60 * 24)
  );
  
  return {
    expirationDate,
    formattedDate,
    isExpired,
    daysUntilExpiration,
  };
}

export function ApiRegistryCard({
  api,
  onRegenerateKey,
  onSoftDelete,
  onCopyApiId,
}: ApiRegistryCardProps) {
  const { formattedDate} = useExpirationInfo(
    api.expirationTime,
  );

  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-lg font-semibold truncate pr-8">
              <Link
                href={`/my-apis/${api.id}`}
                className="hover:text-primary transition-colors"
              >
                {api.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {api.description || 'No description'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8"
              >
                <RiMoreLine className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/my-apis/${api.id}`}>
                  <RiEditLine className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyApiId(api.apiId)}>
                <RiFileCopyLine className="mr-2 h-4 w-4" />
                Copy API ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRegenerateKey(api.id)} disabled>
                <RiKey2Line className="mr-2 h-4 w-4" />
                Regenerate Key
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSoftDelete(api.id)}
                className="text-destructive focus:text-destructive"
                disabled={!api.isActive}
              >
                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <ApiStatusBadge
              isActive={api.isActive}
              expirationTime={api.expirationTime}
            />
            <span className="text-xs text-muted-foreground font-mono">
              {api.apiId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Permission</span>
              <p className="font-medium">{api.permission}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Collections</span>
              <p className="font-medium">{api.recordDefinitions.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Rate Limit</span>
              <p className="font-medium">
                {(api.rateLimit ?? 10000).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Expires {formattedDate}
              </span>
              {api.hasDocsAccess && (
                <span className="text-green-600">Docs Enabled</span>
              )}
            </div>
          </div>

          {api.endpoints.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-1">Endpoints:</p>
              <div className="space-y-1">
                {api.endpoints.slice(0, 2).map((endpoint, idx) => (
                  <p
                    key={idx}
                    className="text-xs font-mono truncate text-muted-foreground"
                  >
                    {endpoint}
                  </p>
                ))}
                {api.endpoints.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{api.endpoints.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
