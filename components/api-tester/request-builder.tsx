'use client';

import { useState } from 'react';
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Param {
  key: string;
  value: string;
}

interface RequestBuilderProps {
  baseUrl: string;
  endpoints: string[];
  onSendRequest: (config: {
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    body: string;
  }) => void;
  isLoading: boolean;
}

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'DELETE'];

export function RequestBuilder({
  baseUrl,
  endpoints,
  onSendRequest,
  isLoading,
}: RequestBuilderProps) {
  const [method, setMethod] = useState('GET');
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0] || '');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [useCustomEndpoint, setUseCustomEndpoint] = useState(false);
  const [headers, setHeaders] = useState<Param[]>([
    { key: 'Content-Type', value: 'application/json' },
  ]);
  const [queryParams, setQueryParams] = useState<Param[]>([]);
  const [body, setBody] = useState('');

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updateQueryParam = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
  };

  const handleSend = () => {
    const headersObj: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.key) headersObj[h.key] = h.value;
    });

    const queryObj: Record<string, string> = {};
    queryParams.forEach((p) => {
      if (p.key) queryObj[p.key] = p.value;
    });

    onSendRequest({
      method,
      endpoint: useCustomEndpoint ? customEndpoint : selectedEndpoint,
      headers: headersObj,
      queryParams: queryObj,
      body,
    });
  };

  const endpoint = useCustomEndpoint ? customEndpoint : selectedEndpoint;
  const fullUrl = `${baseUrl}${endpoint}`;

  return (
    <div className="space-y-6">
      {/* Method & Endpoint */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 flex gap-2">
            {useCustomEndpoint ? (
              <Input
                placeholder="/custom/endpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                className="flex-1"
              />
            ) : (
              <Select
                value={selectedEndpoint}
                onValueChange={setSelectedEndpoint}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((ep) => (
                    <SelectItem key={ep} value={ep}>
                      {ep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUseCustomEndpoint(!useCustomEndpoint)}
            >
              {useCustomEndpoint ? 'Use Preset' : 'Custom'}
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground break-all">
          <span className="font-medium">URL:</span> {fullUrl}
        </div>
      </div>

      {/* Headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Headers</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addHeader}>
            <RiAddLine className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {headers.map((header, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Key"
              value={header.key}
              onChange={(e) => updateHeader(index, 'key', e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={header.value}
              onChange={(e) => updateHeader(index, 'value', e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeHeader(index)}
              disabled={headers.length === 1}
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Query Parameters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Query Parameters</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addQueryParam}
          >
            <RiAddLine className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {queryParams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No query parameters</p>
        ) : (
          queryParams.map((param, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Key"
                value={param.key}
                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={param.value}
                onChange={(e) =>
                  updateQueryParam(index, 'value', e.target.value)
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeQueryParam(index)}
              >
                <RiDeleteBinLine className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Request Body */}
      {method !== 'GET' && (
        <div className="space-y-2">
          <Label>Request Body (JSON)</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={isLoading || !endpoint}
        className="w-full"
      >
        {isLoading ? 'Sending...' : 'Send Request'}
      </Button>
    </div>
  );
}
