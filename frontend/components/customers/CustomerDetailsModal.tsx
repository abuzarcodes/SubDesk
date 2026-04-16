import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient, CustomerDetailsResponse } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface CustomerDetailsModalProps {
  id: number | null;
  isOpen: boolean;
  onClose: () => void;
  onError: (msg: string) => void;
}

export function CustomerDetailsModal({ id, isOpen, onClose, onError }: CustomerDetailsModalProps) {
  const [details, setDetails] = useState<CustomerDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetails = useCallback(async (subscriptionId: number) => {
    setIsLoading(true);
    try {
      const res = await apiClient.getCustomerDetails(subscriptionId);
      if (res.success) {
        setDetails(res.data);
      } else {
        throw new Error('Failed to fetch details');
      }
    } catch (err: any) {
      onError(err.message || 'Failed to fetch customer details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [onError, onClose]);

  useEffect(() => {
    if (isOpen && id !== null) {
      setDetails(null);
      fetchDetails(id);
    } else if (!isOpen) {
      // Clear stale data on close
      const timer = setTimeout(() => setDetails(null), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, id, fetchDetails]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Detailed view of the customer profile, subscription, and event history.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !details ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <div className="space-y-2 pl-4 border-l-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2 relative">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{details.customer.username}</h3>
              <p className="text-sm text-muted-foreground">{details.customer.email}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Subscription</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(details.subscription.status)} variant="secondary">
                    {details.subscription.status.toUpperCase()}
                  </Badge>
                </div>
                {details.subscription.start_date && (
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-1">Started:</span> 
                    <span className="font-medium text-foreground">{format(new Date(details.subscription.start_date), 'PPP')}</span>
                  </div>
                )}
                {details.subscription.expires_at && (
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-1">Expires:</span> 
                    <span className="font-medium text-foreground">{format(new Date(details.subscription.expires_at), 'PPP')}</span>
                  </div>
                )}
                {details.subscription.cancelled_at && (
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-1">Cancelled:</span> 
                    <span className="font-medium text-foreground">{format(new Date(details.subscription.cancelled_at), 'PPP')}</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Plan Details</div>
                <div className="font-medium text-foreground">{details.plan.name}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">${details.plan.price}</span> / {details.plan.billing_cycle}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Event Timeline</h4>
              {details.events && details.events.length > 0 ? (
                <div className="space-y-4 pl-4 border-l-2 border-primary/20 relative">
                  {details.events.map((event, i) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="text-sm font-medium capitalize text-foreground flex items-center justify-between">
                        {event.event_type}
                        <span className="text-xs text-muted-foreground font-normal">
                          {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {event.metadata && (
                        <div className="text-xs text-muted-foreground mt-1 bg-background border border-border p-2 rounded-md font-mono overflow-auto max-w-[400px]">
                          {event.metadata}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No events recorded.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
