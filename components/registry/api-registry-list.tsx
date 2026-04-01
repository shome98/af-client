'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RiAddLine, RiSearchLine, RiAlertLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiRegistryCard } from './api-registry-card';
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
  fetchApis,
  softDeleteRegistryApi,
  regenerateRegistryApiKey,
  clearErrors,
  setPage,
  setLimit,
} from '@/lib/store/registry-store';
import { toast } from 'sonner';

export function ApiRegistryList() {
  const dispatch = useAppDispatch();
  const {
    apis,
    pagination,
    isLoading,
    isDeleting,
    isRegeneratingKey,
    error,
    deleteError,
    regenerateKeyError,
  } = useAppSelector((state) => state.registry);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  useEffect(() => {
    const params: {
      page: number;
      limit: number;
      isActive?: boolean;
      search?: string;
    } = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (statusFilter === 'active') {
      params.isActive = true;
    } else if (statusFilter === 'inactive') {
      params.isActive = false;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    dispatch(fetchApis(params));
  }, [dispatch, pagination.page, pagination.limit, statusFilter, searchQuery]);

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

  const handleRegenerateKey = (id: string) => {
    setSelectedApiId(id);
    setRegenerateDialogOpen(true);
  };

  const confirmRegenerateKey = async () => {
    if (!selectedApiId) return;

    const result = await dispatch(regenerateRegistryApiKey(selectedApiId));
    if (regenerateRegistryApiKey.fulfilled.match(result)) {
      setNewApiKey(result.payload.newApiKey);
      toast.success('API key regenerated successfully');
    }
    setRegenerateDialogOpen(false);
  };

  const handleSoftDelete = (id: string) => {
    setSelectedApiId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedApiId) return;

    const result = await dispatch(softDeleteRegistryApi(selectedApiId));
    if (softDeleteRegistryApi.fulfilled.match(result)) {
      toast.success('API deactivated successfully');
    }
    setDeleteDialogOpen(false);
  };

  const handleCopyApiId = (apiId: string) => {
    navigator.clipboard.writeText(apiId);
    toast.success('API ID copied to clipboard');
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit: string) => {
    dispatch(setLimit(parseInt(newLimit, 10)));
    dispatch(setPage(1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My APIs</h1>
          <p className="text-sm text-muted-foreground">
            Manage your registered API configurations
          </p>
        </div>
        <Button asChild>
          <Link href="/create-api">
            <RiAddLine className="mr-2 h-4 w-4" />
            Create New API
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <RiAlertLine className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          {/* API Grid */}
          {apis.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground mb-4">No APIs found</p>
              <Button asChild variant="outline">
                <Link href="/create-api">Create your first API</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apis.map((api) => (
                <ApiRegistryCard
                  key={api.id}
                  api={api}
                  onRegenerateKey={handleRegenerateKey}
                  onSoftDelete={handleSoftDelete}
                  onCopyApiId={handleCopyApiId}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Select
                  value={String(pagination.limit)}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate API</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this API? You can reactivate
              it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deactivating...' : 'Deactivate'}
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
            <Button onClick={confirmRegenerateKey} disabled={isRegeneratingKey}>
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
