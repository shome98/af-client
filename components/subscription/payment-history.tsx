'use client';

import { useEffect, useState } from 'react';
import {
  RiHistoryLine,
  RiCheckLine,
  RiTimeLine,
  RiCloseCircleLine,
} from '@remixicon/react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchPaymentHistory } from '@/lib/store/subscription-store';
import type { Payment } from '@/types/payments.types';

interface PaymentHistoryProps {
  provider: 'razorpay' | 'stripe' | 'paypal';
}

export function PaymentHistory({ provider }: PaymentHistoryProps) {
  const dispatch = useAppDispatch();
  const { payments, isLoadingPayments, paymentError } = useAppSelector(
    (state) => state.payments,
  );

  useEffect(() => {
    dispatch(fetchPaymentHistory({ provider, page: 1, limit: 10 }));
  }, [dispatch, provider]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <RiCheckLine className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <RiTimeLine className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <RiCloseCircleLine className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingPayments) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <RiHistoryLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No payment history found</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{provider} Payments</CardTitle>
        <CardDescription>Your recent payment history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment: Payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {typeof payment.amount === 'string'
                    ? `$${parseFloat(payment.amount).toFixed(2)}`
                    : `$${(payment.amount / 100).toFixed(2)}`}{' '}
                  {payment.currency.toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    {getStatusBadge(payment.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
