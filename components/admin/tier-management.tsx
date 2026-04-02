'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchAllTiersAdmin,
  createTierAdmin,
  updateTierAdmin,
  deleteTierAdmin,
  clearErrors,
} from '@/lib/store/subscription-store';
import type { PermissionType } from '@/types/mongo.types';
import { toast } from 'sonner';

const tierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  limit: z.number().min(1, 'Limit must be at least 1'),
  permission: z.enum(['SCRUD', 'SCRUDQ', 'MCRUD', 'MCRUDQ'] as const),
  benefits: z.string().min(1, 'At least one benefit is required'),
  isActive: z.boolean(),
});

type TierFormData = z.infer<typeof tierSchema>;

export function TierManagement() {
  const dispatch = useAppDispatch();
  const { tiers, isLoadingTiers, adminError } = useAppSelector(
    (state) => state.payments,
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[0] | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      permission: 'SCRUD',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    dispatch(fetchAllTiersAdmin({}));

    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  const handleCreate = async (data: TierFormData) => {
    const benefits = data.benefits.split('\n').filter((b) => b.trim());

    const result = await dispatch(
      createTierAdmin({
        name: data.name,
        description: data.description,
        price: data.price,
        limit: data.limit,
        permission: data.permission,
        benefits,
        isActive: data.isActive,
      }),
    );

    if (createTierAdmin.fulfilled.match(result)) {
      toast.success('Tier created successfully');
      setIsCreateDialogOpen(false);
      reset();
    }
  };

  const handleEdit = async (data: TierFormData) => {
    if (!selectedTier) return;

    const benefits = data.benefits.split('\n').filter((b) => b.trim());

    const result = await dispatch(
      updateTierAdmin({
        id: selectedTier.id,
        payload: {
          name: data.name,
          description: data.description,
          price: data.price,
          limit: data.limit,
          permission: data.permission,
          benefits,
          isActive: data.isActive,
        },
      }),
    );

    if (updateTierAdmin.fulfilled.match(result)) {
      toast.success('Tier updated successfully');
      setIsEditDialogOpen(false);
      setSelectedTier(null);
      reset();
    }
  };

  const handleDelete = async () => {
    if (!selectedTier) return;

    const result = await dispatch(deleteTierAdmin(selectedTier.id));

    if (deleteTierAdmin.fulfilled.match(result)) {
      toast.success('Tier deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedTier(null);
    }
  };

  const openEditDialog = (tier: (typeof tiers)[0]) => {
    setSelectedTier(tier);
    setValue('name', tier.name);
    setValue('description', tier.description);
    setValue('price', Number(tier.price));
    setValue('limit', tier.limit);
    setValue('permission', tier.permission);
    setValue('benefits', tier.benefits.join('\n'));
    setValue('isActive', tier.isActive);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (tier: (typeof tiers)[0]) => {
    setSelectedTier(tier);
    setIsDeleteDialogOpen(true);
  };

  const TierForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: (data: TierFormData) => void;
    submitLabel: string;
  }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={2} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (e.g., 9.99)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
            placeholder="9.99"
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="limit">API Limit</Label>
          <Input
            id="limit"
            type="number"
            min="1"
            {...register('limit', { valueAsNumber: true })}
          />
          {errors.limit && (
            <p className="text-sm text-red-500">{errors.limit.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="permission">Permission</Label>
        <select
          id="permission"
          {...register('permission')}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="SCRUD">SCRUD (Standard CRUD)</option>
          <option value="SCRUDQ">SCRUDQ (CRUD + Query)</option>
          <option value="MCRUD">MCRUD (Multi-tenant CRUD)</option>
          <option value="MCRUDQ">MCRUDQ (Multi-tenant CRUD + Query)</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">Benefits (one per line)</Label>
        <Textarea
          id="benefits"
          {...register('benefits')}
          rows={4}
          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
        />
        {errors.benefits && (
          <p className="text-sm text-red-500">{errors.benefits.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setValue('isActive', checked)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <DialogFooter>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <RiAddLine className="h-4 w-4 mr-1" />
          Create Tier
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Tier Management</h1>
        <p className="text-muted-foreground">
          Manage subscription tiers and pricing plans
        </p>
      </div>

      {adminError && (
        <Alert variant="destructive">
          <AlertDescription>{adminError}</AlertDescription>
        </Alert>
      )}

      {/* Tiers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tiers</CardTitle>
          <CardDescription>
            {tiers.length} tier{tiers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTiers ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : tiers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tiers found. Create your first tier to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell>${tier.price}</TableCell>
                    <TableCell>{tier.limit} APIs</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tier.permission}</Badge>
                    </TableCell>
                    <TableCell>
                      {tier.isActive ? (
                        <Badge className="bg-green-100 text-green-700">
                          <RiCheckLine className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <RiCloseLine className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(tier)}
                        >
                          <RiEditLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(tier)}
                        >
                          <RiDeleteBinLine className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Tier</DialogTitle>
            <DialogDescription>Add a new subscription tier</DialogDescription>
          </DialogHeader>
          <TierForm onSubmit={handleCreate} submitLabel="Create Tier" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Tier</DialogTitle>
            <DialogDescription>Update tier details</DialogDescription>
          </DialogHeader>
          <TierForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedTier?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
