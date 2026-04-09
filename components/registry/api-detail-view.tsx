'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RiArrowLeftLine,
  RiFileCopyLine,
  RiKey2Line,
  RiDeleteBinLine,
  RiEditLine,
  RiExternalLinkLine,
  RiTestTubeLine,
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
import { Spinner } from '@/components/ui/spinner';
import { ApiStatusBadge } from './api-status-badge';
import { SchemaViewer } from './schema-viewer';
import { USER_ROUTES } from '@/constants/routes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchApiById,
  softDeleteRegistryApi,
  hardDeleteRegistryApi,
  regenerateRegistryApiKey,
  clearSelectedApi,
  clearErrors,
} from '@/lib/store/registry-store';
import { toast } from 'sonner';

interface ApiDetailViewProps {
  apiId: string;
}

export function ApiDetailView({ apiId }: ApiDetailViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    selectedApi,
    isLoading,
    isDeleting,
    isRegeneratingKey,
    error,
    deleteError,
    regenerateKeyError,
  } = useAppSelector((state) => state.registry);

  const [softDeleteDialogOpen, setSoftDeleteDialogOpen] = useState(false);
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchApiById(apiId));

    return () => {
      dispatch(clearSelectedApi());
    };
  }, [dispatch, apiId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearErrors());
    }
    if (regenerateKeyError) {
      toast.error(regenerateKeyError);
      dispatch(clearErrors());
    }
  }, [error, deleteError, regenerateKeyError, dispatch]);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleSoftDelete = async () => {
    const result = await dispatch(softDeleteRegistryApi(apiId));
    if (softDeleteRegistryApi.fulfilled.match(result)) {
      toast.success('API deactivated successfully');
      setSoftDeleteDialogOpen(false);
    }
  };

  const handleHardDelete = async () => {
    const result = await dispatch(hardDeleteRegistryApi(apiId));
    if (hardDeleteRegistryApi.fulfilled.match(result)) {
      toast.success('API permanently deleted');
      setHardDeleteDialogOpen(false);
      router.push(USER_ROUTES.APIS);
    }
  };

  const handleRegenerateKey = async () => {
    const result = await dispatch(regenerateRegistryApiKey(apiId));
    if (regenerateRegistryApiKey.fulfilled.match(result)) {
      setNewApiKey(result.payload.newApiKey);
      toast.success('API key regenerated successfully');
      setRegenerateDialogOpen(false);
    }
  };

  if (isLoading || !selectedApi) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const api = selectedApi;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/my-apis">
              <RiArrowLeftLine className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {api.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {api.description || 'No description'}
            </p>
          </div>
        </div>

        {/* <div className="flex gap-2">
          <Button variant="outline" disabled asChild>
            <Link href={`/my-apis/${apiId}/test`}>
              <RiTestTubeLine className="mr-2 h-4 w-4" />
              Test API
            </Link>
          </Button>
          <Button variant="outline" disabled asChild>
            <Link href={`/my-apis/${apiId}/edit`}>
              <RiEditLine className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div> */}
      </div>

      {/* Status Banner */}
      <div className="flex items-center gap-4">
        <ApiStatusBadge
          isActive={api.isActive}
          expirationTime={api.expirationTime}
        />
        <Badge variant="outline">{api.permission}</Badge>
        <Badge variant="outline">{api.databaseType}</Badge>
        {api.softDelete && <Badge variant="outline">Soft Delete</Badge>}
        {api.hasDocsAccess && <Badge variant="outline">Docs Enabled</Badge>}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schema Card */}
          <Card>
            <CardHeader>
              <CardTitle>Schema Definition</CardTitle>
              <CardDescription>
                Record definitions and field configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaViewer recordDefinitions={api.recordDefinitions} />
            </CardContent>
          </Card>

          {/* Endpoints Card */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
              <CardDescription>
                Generated API endpoints for your collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {api.endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-md"
                  >
                    <code className="text-sm font-mono truncate flex-1">
                      {endpoint}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        handleCopyToClipboard(endpoint, 'Endpoint')
                      }
                    >
                      <RiFileCopyLine className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="space-y-6">
          {/* API Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>API Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">API ID</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">{api.apiId}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopyToClipboard(api.apiId, 'API ID')}
                  >
                    <RiFileCopyLine className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <span className="text-sm text-muted-foreground">Database</span>
                <p className="font-medium">{api.dbName}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Expires</span>
                <p className="font-medium">
                  {new Date(api.expirationTime).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p className="font-medium">
                  {new Date(api.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">
                  Last Updated
                </span>
                <p className="font-medium">
                  {new Date(api.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setRegenerateDialogOpen(true)}
                disabled
              >
                <RiKey2Line className="mr-2 h-4 w-4" />
                Regenerate API Key
              </Button>

              {api.hasDocsAccess && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL}/api/v1/${api.apiId}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RiExternalLinkLine className="mr-2 h-4 w-4" />
                    View Documentation
                  </a>
                </Button>
              )}

              <Separator />

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSoftDeleteDialogOpen(true)}
                disabled={!api.isActive}
              >
                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                Deactivate API
              </Button>

              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => setHardDeleteDialogOpen(true)}
              >
                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                Permanently Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Soft Delete Dialog */}
      <Dialog
        open={softDeleteDialogOpen}
        onOpenChange={setSoftDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate API</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this API? You can reactivate
              it later by editing the API.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSoftDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSoftDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hard Delete Dialog */}
      <Dialog
        open={hardDeleteDialogOpen}
        onOpenChange={setHardDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete API</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the API
              configuration from the registry.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHardDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleHardDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Key Dialog */}
      <Dialog
        open={regenerateDialogOpen}
        onOpenChange={setRegenerateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
            <DialogDescription>
              This will invalidate the current API key and generate a new one.
              Any applications using the old key will need to be updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegenerateDialogOpen(false)}
              disabled={isRegeneratingKey}
            >
              Cancel
            </Button>
            <Button onClick={handleRegenerateKey} disabled={isRegeneratingKey}>
              {isRegeneratingKey ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New API Key Display Dialog */}
      <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New API Key Generated</DialogTitle>
            <DialogDescription>
              Copy this API key now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-3 rounded-md">
            <code className="text-sm break-all">{newApiKey}</code>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (newApiKey) {
                  navigator.clipboard.writeText(newApiKey);
                  toast.success('API key copied to clipboard');
                }
                setNewApiKey(null);
              }}
            >
              Copy and Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
