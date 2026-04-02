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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchAllDiscountsAdmin,
  fetchAllTiersAdmin,
  createDiscountAdmin,
  updateDiscountAdmin,
  deleteDiscountAdmin,
  clearErrors,
} from '@/lib/store/subscription-store';
import { toast } from 'sonner';

const discountSchema = z.object({
  tierId: z.string().min(1, 'Tier is required'),
  code: z.string().min(3, 'Code must be at least 3 characters'),
  discountPercentage: z.number().min(1).max(100),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  maxUses: z.number().min(1),
  isActive: z.boolean(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

export function DiscountManagement() {
  const dispatch = useAppDispatch();
  const { discounts, tiers, isLoadingDiscounts, adminError } = useAppSelector(
    (state) => state.payments,
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<
    (typeof discounts)[0] | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      discountPercentage: 10,
      maxUses: 100,
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    dispatch(fetchAllDiscountsAdmin());
    dispatch(fetchAllTiersAdmin({}));

    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  const handleCreate = async (data: DiscountFormData) => {
    const result = await dispatch(
      createDiscountAdmin({
        tierId: data.tierId,
        code: data.code.toUpperCase(),
        discountPercentage: data.discountPercentage,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        maxUses: data.maxUses,
        isActive: data.isActive,
      }),
    );

    if (createDiscountAdmin.fulfilled.match(result)) {
      toast.success('Discount created successfully');
      setIsCreateDialogOpen(false);
      reset();
    }
  };

  const handleEdit = async (data: DiscountFormData) => {
    if (!selectedDiscount) return;

    const result = await dispatch(
      updateDiscountAdmin({
        id: selectedDiscount.id,
        payload: {
          tierId: data.tierId,
          code: data.code.toUpperCase(),
          discountPercentage: data.discountPercentage,
          validFrom: data.validFrom,
          validUntil: data.validUntil,
          maxUses: data.maxUses,
          isActive: data.isActive,
        },
      }),
    );

    if (updateDiscountAdmin.fulfilled.match(result)) {
      toast.success('Discount updated successfully');
      setIsEditDialogOpen(false);
      setSelectedDiscount(null);
      reset();
    }
  };

  const handleDelete = async () => {
    if (!selectedDiscount) return;

    const result = await dispatch(deleteDiscountAdmin(selectedDiscount.id));

    if (deleteDiscountAdmin.fulfilled.match(result)) {
      toast.success('Discount deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedDiscount(null);
    }
  };

  const openEditDialog = (discount: (typeof discounts)[0]) => {
    setSelectedDiscount(discount);
    setValue('tierId', discount.tierId);
    setValue('code', discount.code);
    setValue('discountPercentage', Number(discount.discountPercentage));
    setValue('validFrom', discount.validFrom.slice(0, 16)); // Format for datetime-local
    setValue('validUntil', discount.validUntil.slice(0, 16));
    setValue('maxUses', discount.maxUses);
    setValue('isActive', discount.isActive);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (discount: (typeof discounts)[0]) => {
    setSelectedDiscount(discount);
    setIsDeleteDialogOpen(true);
  };

  const getTierName = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId);
    return tier?.name || 'Unknown Tier';
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const DiscountForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: (data: DiscountFormData) => void;
    submitLabel: string;
  }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tierId">Tier</Label>
        <select
          id="tierId"
          {...register('tierId')}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="">Select a tier</option>
          {tiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.name} (${tier.price})
            </option>
          ))}
        </select>
        {errors.tierId && (
          <p className="text-sm text-red-500">{errors.tierId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Discount Code</Label>
        <Input id="code" {...register('code')} placeholder="SUMMER2024" />
        {errors.code && (
          <p className="text-sm text-red-500">{errors.code.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountPercentage">Discount %</Label>
          <Input
            id="discountPercentage"
            type="number"
            min={1}
            max={100}
            {...register('discountPercentage', { valueAsNumber: true })}
          />
          {errors.discountPercentage && (
            <p className="text-sm text-red-500">
              {errors.discountPercentage.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxUses">Max Uses</Label>
          <Input
            id="maxUses"
            type="number"
            min={1}
            {...register('maxUses', { valueAsNumber: true })}
          />
          {errors.maxUses && (
            <p className="text-sm text-red-500">{errors.maxUses.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid From</Label>
          <Input
            id="validFrom"
            type="datetime-local"
            {...register('validFrom')}
          />
          {errors.validFrom && (
            <p className="text-sm text-red-500">{errors.validFrom.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until</Label>
          <Input
            id="validUntil"
            type="datetime-local"
            {...register('validUntil')}
          />
          {errors.validUntil && (
            <p className="text-sm text-red-500">{errors.validUntil.message}</p>
          )}
        </div>
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
          Create Discount
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Discount Management</h1>
        <p className="text-muted-foreground">
          Manage promotional codes and discounts
        </p>
      </div>

      {adminError && (
        <Alert variant="destructive">
          <AlertDescription>{adminError}</AlertDescription>
        </Alert>
      )}

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Discounts</CardTitle>
          <CardDescription>
            {discounts.length} discount{discounts.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDiscounts ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : discounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No discounts found. Create your first discount to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => {
                  const expired = isExpired(discount.validUntil);
                  const fullyUsed = discount.usedCount >= discount.maxUses;

                  return (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium">
                        <code className="rounded bg-muted px-2 py-1">
                          {discount.code}
                        </code>
                      </TableCell>
                      <TableCell>{getTierName(discount.tierId)}</TableCell>
                      <TableCell>{discount.discountPercentage}%</TableCell>
                      <TableCell>
                        {discount.usedCount} / {discount.maxUses}
                      </TableCell>
                      <TableCell>
                        {!discount.isActive ? (
                          <Badge variant="secondary">Inactive</Badge>
                        ) : expired ? (
                          <Badge variant="outline" className="text-orange-600">
                            Expired
                          </Badge>
                        ) : fullyUsed ? (
                          <Badge variant="outline" className="text-red-600">
                            Fully Used
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(discount)}
                          >
                            <RiEditLine className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(discount)}
                          >
                            <RiDeleteBinLine className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Discount</DialogTitle>
            <DialogDescription>
              Add a new promotional discount code
            </DialogDescription>
          </DialogHeader>
          <DiscountForm onSubmit={handleCreate} submitLabel="Create Discount" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
            <DialogDescription>Update discount details</DialogDescription>
          </DialogHeader>
          <DiscountForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discount</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the discount code &quot;
              {selectedDiscount?.code}&quot;? This action cannot be undone.
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
