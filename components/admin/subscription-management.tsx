'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  RiArrowLeftLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiRefreshLine,
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
  fetchAllSubscriptionsAdmin,
  fetchAllTiersAdmin,
  updateSubscriptionAdmin,
  clearErrors,
} from '@/lib/store/subscription-store';
import { toast } from 'sonner';

const subscriptionSchema = z.object({
  isSubscribed: z.boolean(),
  tierId: z.string().min(1, 'Tier is required'),
  status: z.enum(['active', 'cancelled', 'expired', 'pending']),
  limitLeft: z.number().min(0),
  autoRenew: z.boolean(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export function SubscriptionManagement() {
  const dispatch = useAppDispatch();
  const { subscriptions, tiers, isLoadingSubscriptions, adminError } =
    useAppSelector((state) => state.payments);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<
    (typeof subscriptions)[0] | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
  });

  const isSubscribed = watch('isSubscribed');
  const autoRenew = watch('autoRenew');

  useEffect(() => {
    dispatch(fetchAllSubscriptionsAdmin({}));
    dispatch(fetchAllTiersAdmin({}));

    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  const handleEdit = async (data: SubscriptionFormData) => {
    if (!selectedSubscription) return;

    const result = await dispatch(
      updateSubscriptionAdmin({
        id: selectedSubscription.id,
        payload: {
          isSubscribed: data.isSubscribed,
          tierId: data.tierId,
          status: data.status,
          limitLeft: data.limitLeft,
          autoRenew: data.autoRenew,
        },
      }),
    );

    if (updateSubscriptionAdmin.fulfilled.match(result)) {
      toast.success('Subscription updated successfully');
      setIsEditDialogOpen(false);
      setSelectedSubscription(null);
      reset();
    }
  };

  const openEditDialog = (subscription: (typeof subscriptions)[0]) => {
    setSelectedSubscription(subscription);
    setValue('isSubscribed', subscription.isSubscribed);
    setValue('tierId', subscription.tierId);
    setValue('status', subscription.status);
    setValue('limitLeft', subscription.limitLeft);
    setValue('autoRenew', subscription.autoRenew);
    setIsEditDialogOpen(true);
  };

  const getTierName = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId);
    return tier?.name || 'Unknown Tier';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700">
            <RiCheckLine className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary">
            <RiCloseLine className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="text-orange-600">
            Expired
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <RiArrowLeftLine className="h-4 w-4 mr-1" />
              Back to Admin
            </Link>
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => dispatch(fetchAllSubscriptionsAdmin({}))}
        >
          <RiRefreshLine className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">
          View and manage user subscriptions
        </p>
      </div>

      {adminError && (
        <Alert variant="destructive">
          <AlertDescription>{adminError}</AlertDescription>
        </Alert>
      )}

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            {subscriptions.length} subscription
            {subscriptions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSubscriptions ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No subscriptions found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Limit Left</TableHead>
                  <TableHead>Auto Renew</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-mono text-xs max-w-[150px] truncate">
                      {subscription.userId}
                    </TableCell>
                    <TableCell>{getTierName(subscription.tierId)}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>{subscription.limitLeft}</TableCell>
                    <TableCell>
                      {subscription.autoRenew ? (
                        <RiCheckLine className="h-4 w-4 text-green-600" />
                      ) : (
                        <RiCloseLine className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription.expiresAt
                        ? new Date(subscription.expiresAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(subscription)}
                      >
                        <RiEditLine className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription details for user
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isSubscribed"
                checked={isSubscribed}
                onCheckedChange={(checked) => setValue('isSubscribed', checked)}
              />
              <Label htmlFor="isSubscribed">Subscribed</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tierId">Tier</Label>
              <select
                id="tierId"
                {...register('tierId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
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
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limitLeft">APIs Left</Label>
              <Input
                id="limitLeft"
                type="number"
                min={0}
                {...register('limitLeft')}
              />
              {errors.limitLeft && (
                <p className="text-sm text-red-500">
                  {errors.limitLeft.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoRenew"
                checked={autoRenew}
                onCheckedChange={(checked) => setValue('autoRenew', checked)}
              />
              <Label htmlFor="autoRenew">Auto Renew</Label>
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
