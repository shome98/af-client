'use client';

import { useState } from 'react';
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiTimeLine,
  RiFileCopyLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
}

interface ResponseViewerProps {
  response: ApiResponse | null;
  error: string | null;
}

function formatJson(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-700';
  if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-700';
  if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

export function ResponseViewer({ response, error }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState('body');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-700">
          <RiErrorWarningLine className="h-5 w-5" />
          <span className="font-medium">Error</span>
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Send a request to see the response
        </p>
      </div>
    );
  }

  const responseBody = formatJson(response.data);
  const headersText = Object.entries(response.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center gap-4 rounded-lg border p-3">
        <Badge className={getStatusColor(response.status)}>
          {response.status} {response.statusText}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <RiTimeLine className="h-4 w-4" />
          {response.duration}ms
        </div>
      </div>

      {/* Response Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="space-y-2">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(responseBody)}
            >
              <RiFileCopyLine className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <pre className="rounded-lg bg-muted p-4 overflow-auto max-h-[400px] text-sm font-mono">
            {responseBody}
          </pre>
        </TabsContent>

        <TabsContent value="headers" className="space-y-2">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(headersText)}
            >
              <RiFileCopyLine className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <pre className="rounded-lg bg-muted p-4 overflow-auto max-h-[400px] text-sm font-mono">
            {headersText || 'No headers'}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
