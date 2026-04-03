'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RiArrowLeftLine, RiTestTubeLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequestBuilder } from './request-builder';
import { ResponseViewer } from './response-viewer';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchApiById, clearErrors } from '@/lib/store/registry-store';

interface ApiTesterProps {
  apiId: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
}

export function ApiTester({ apiId }: ApiTesterProps) {
  const dispatch = useAppDispatch();
  const { selectedApi, isLoading, error } = useAppSelector(
    (state) => state.registry,
  );

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const MONGO_FACTORY_BASE_URL =
    process.env.NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL;

  useEffect(() => {
    dispatch(fetchApiById(apiId));

    return () => {
      dispatch(clearErrors());
    };
  }, [apiId, dispatch]);

  const handleSendRequest = async (config: {
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    body: string;
  }) => {
    if (!selectedApi) return;

    setIsSending(true);
    setRequestError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      // Build URL with query params
      const url = new URL(
        `${MONGO_FACTORY_BASE_URL}/api/v1/temp/${selectedApi.apiId}${config.endpoint}`,
      );
      Object.entries(config.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const fetchOptions: RequestInit = {
        method: config.method,
        headers: {
          ...config.headers,
          'x-api-key': selectedApi.apiId, // Using apiId as the API key
        },
      };

      if (config.method !== 'GET' && config.body) {
        fetchOptions.body = config.body;
      }

      const res = await fetch(url.toString(), fetchOptions);
      const duration = Math.round(performance.now() - startTime);

      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let data: unknown;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers,
        data,
        duration,
      });
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !selectedApi) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'API not found'}</AlertDescription>
      </Alert>
    );
  }

  const baseUrl = `${MONGO_FACTORY_BASE_URL}/api/v1/temp/${selectedApi.apiId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/my-apis/${apiId}`}>
            <RiArrowLeftLine className="h-4 w-4 mr-1" />
            Back to API
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RiTestTubeLine className="h-6 w-6" />
          Test API: {selectedApi.name}
        </h1>
        <p className="text-muted-foreground">
          Send requests to your generated API endpoints
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure and send API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestBuilder
              baseUrl={baseUrl}
              endpoints={selectedApi.endpoints}
              onSendRequest={handleSendRequest}
              isLoading={isSending}
            />
          </CardContent>
        </Card>

        {/* Response Viewer */}
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>View API response details</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponseViewer response={response} error={requestError} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
