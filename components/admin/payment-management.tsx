'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RiArrowLeftLine,
  RiRefreshLine,
  RiRefundLine,
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
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchAllPaymentsAdmin,
  processRefundAdmin,
  clearErrors,
} from '@/lib/store/subscription-store';
import { toast } from 'sonner';

export function PaymentManagement() {
  const dispatch = useAppDispatch();
  const { payments, isLoadingPayments, adminError } = useAppSelector(
    (state) => state.payments,
  );

  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<
    (typeof payments)[0] | null
  >(null);

  useEffect(() => {
    dispatch(fetchAllPaymentsAdmin({}));

    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  const handleRefund = async () => {
    if (!selectedPayment) return;

    const result = await dispatch(
      processRefundAdmin({
        provider: selectedPayment.provider,
        paymentId: selectedPayment.id,
      }),
    );

    if (processRefundAdmin.fulfilled.match(result)) {
      toast.success('Refund processed successfully');
      setIsRefundDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  const openRefundDialog = (payment: (typeof payments)[0]) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'captured':
      case 'completed':
      case 'succeeded':
        return (
          <Badge className="bg-green-100 text-green-700">
            <RiCheckLine className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="outline" className="text-orange-600">
            Refunded
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <RiCloseLine className="h-3 w-3 mr-1" />
            Failed
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

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'razorpay':
        return <Badge variant="secondary">Razorpay</Badge>;
      case 'stripe':
        return <Badge variant="secondary">Stripe</Badge>;
      case 'paypal':
        return <Badge variant="secondary">PayPal</Badge>;
      default:
        return <Badge variant="outline">{provider}</Badge>;
    }
  };

  // Calculate summary stats
  const totalRevenue = payments
    .filter((p) => ['captured', 'completed', 'succeeded'].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const refundAmount = payments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch(fetchAllPaymentsAdmin({}))}
        >
          <RiRefreshLine className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">
          View all payments and process refunds
        </p>
      </div>

      {adminError && (
        <Alert variant="destructive">
          <AlertDescription>{adminError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">
              ${totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Refunds</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              ${refundAmount.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Revenue</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              ${(totalRevenue - refundAmount).toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            {payments.length} payment{payments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No payments found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{getProviderBadge(payment.provider)}</TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount}
                    </TableCell>
                    <TableCell className="uppercase">
                      {payment.currency}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.tier?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {['captured', 'completed', 'succeeded'].includes(
                        payment.status,
                      ) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRefundDialog(payment)}
                        >
                          <RiRefundLine className="h-4 w-4 mr-1" />
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this payment of $
              {selectedPayment?.amount}{' '}
              {selectedPayment?.currency.toUpperCase()}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRefundDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRefund}>
              <RiRefundLine className="h-4 w-4 mr-1" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
