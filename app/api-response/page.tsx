'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiFileCopyLine,
  RiExternalLinkLine,
  RiTimeLine,
  RiDatabase2Line,
  RiKeyLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  loadApiSession,
  clearApiSession,
  selectIsSessionExpired,
} from '@/lib/store/mongo-store';
import { toast } from 'sonner';

export default function ApiResponsePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { apiSession, isHydrated, isCreating } = useAppSelector(
    (state) => state.mongoApi,
  );
  const isExpired = useAppSelector(selectIsSessionExpired);

  useEffect(() => {
    if (!isHydrated) {
      dispatch(loadApiSession());
    }
  }, [dispatch, isHydrated]);

  useEffect(() => {
    if (isHydrated && !apiSession && !isCreating) {
      // No session found, redirect to create API page
      router.push('/create-api');
    }
  }, [isHydrated, apiSession, isCreating, router]);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleClearSession = () => {
    dispatch(clearApiSession());
    router.push('/create-api');
  };

  if (!isHydrated || isCreating) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading API session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!apiSession) {
    return null; // Will redirect
  }

  const expiresAt = new Date(apiSession.expiresAt);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            API Created Successfully
          </h1>
          <p className="text-muted-foreground mt-1">
            Your temporary MongoDB API is ready to use
          </p>
        </div>
        <Button variant="outline" onClick={handleClearSession}>
          Create New API
        </Button>
      </div>

      {/* Expiration Warning */}
      {isExpired ? (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-destructive">
              <RiTimeLine className="w-5 h-5" />
              <span className="font-medium">This API session has expired</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* API Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiKeyLine className="w-5 h-5" />
            API Credentials
          </CardTitle>
          <CardDescription>
            Save these credentials securely. The API key will not be shown
            again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API ID */}
          <div className="space-y-2">
            <Label>API ID</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {apiSession.apiId}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleCopyToClipboard(apiSession.apiId, 'API ID')
                }
              >
                <RiFileCopyLine className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {apiSession.apiKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleCopyToClipboard(apiSession.apiKey, 'API Key')
                }
              >
                <RiFileCopyLine className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Expiration */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Expires At</Label>
              <p className="text-sm text-muted-foreground">
                {apiSession.expiresAt}
              </p>
            </div>
            <Badge variant={isExpired ? 'destructive' : 'default'}>
              {isExpired ? 'Expired' : 'Active'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiDatabase2Line className="w-5 h-5" />
            API Endpoints
          </CardTitle>
          <CardDescription>
            Available endpoints for your collections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiSession.endpoints.map((endpoint, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{apiSession.collections[index]}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                  {endpoint}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyToClipboard(endpoint, 'Endpoint')}
                >
                  <RiFileCopyLine className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Access the Swagger documentation for your API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
              {apiSession.checkDocsAt}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(apiSession.checkDocsAt, '_blank')}
            >
              <RiExternalLinkLine className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            Example code to interact with your API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
            {`// Example: Create a record
fetch('${apiSession.endpoints[0]}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiSession.apiKey}'
  },
  body: JSON.stringify({
    // Your data here
  })
})

// Example: List records
fetch('${apiSession.endpoints[0]}?page=1&limit=10', {
  headers: {
    'x-api-key': '${apiSession.apiKey}'
  }
})`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for labels
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
}
