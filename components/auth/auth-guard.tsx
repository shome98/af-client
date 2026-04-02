'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Spinner } from '@/components/ui/spinner';
import { useAppSelector } from '@/lib/store/hooks';

function GuardFallback() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Restoring session...
      </div>
    </div>
  );
}

export function ProtectedGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isBootstrapping, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isBootstrapping, router]);

  if (isBootstrapping) {
    return <GuardFallback />;
  }

  if (!isAuthenticated) {
    // Let the route transition happen without leaving the stale protected shell onscreen.
    return null;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isBootstrapping, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isBootstrapping && isAuthenticated && user?.role !== 'admin') {
      router.replace('/my-dashboard');
    }
  }, [isAuthenticated, isBootstrapping, router, user?.role]);

  if (isBootstrapping) {
    return <GuardFallback />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    // Once auth is settled, hand off to the redirect instead of rendering the fallback forever.
    return null;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isBootstrapping, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace('/my-dashboard');
    }
  }, [isAuthenticated, isBootstrapping, router]);

  if (isBootstrapping) {
    return <GuardFallback />;
  }

  if (isAuthenticated) {
    // Auth pages should disappear immediately after login while the redirect resolves.
    return null;
  }

  return <>{children}</>;
}
