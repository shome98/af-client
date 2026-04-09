/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { authApi, userApi } from '@/lib/actions/auth-api';
import { getApiErrorMessage } from '@/lib/auth/error-helpers';
import { useAppSelector } from '@/lib/store/hooks';
import type { ProfileUser } from '@/types/auth.types';

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await userApi.getProfile();
        setProfile(response.data?.user ?? null);
      } catch {
        setProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    void run();
  }, []);

  if (!user) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);

    try {
      await authApi.resendVerification({ email: user.email });
      toast.success('Verification email sent.');
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to resend verification email.'),
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Account overview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {user.name || user.email}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The original auth flow is now running inside the App Router with
          Redux-backed session state and the same backend API contract.
        </p>
      </div>

      {!user.emailVerified ? (
        <Card className="border-orange-200 bg-orange-50/60 dark:border-orange-400/20 dark:bg-orange-500/10">
          <CardHeader>
            <CardTitle className="text-lg">
              Email verification pending
            </CardTitle>
            <CardDescription>
              Verify your email to unlock the full authenticated experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Live identity details from your current authenticated session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {(user.name?.[0] || user.email[0]).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <p className="font-medium">{user.name || 'No display name'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge
                  variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                >
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email verified</span>
                <Badge variant={user.emailVerified ? 'secondary' : 'outline'}>
                  {user.emailVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile meta</CardTitle>
            <CardDescription>
              Server profile details pulled from the user endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoadingProfile ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="size-4" />
                Loading profile details...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleString()
                      : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="truncate font-mono text-xs">{user.id}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
