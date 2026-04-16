import React, { memo, useState } from 'react';
import { CustomerItem } from '@/lib/api';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, PauseCircle, PlayCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CustomerRowProps {
  item: CustomerItem;
  isSelected: boolean;
  onToggle: () => void;
  onAction: (id: number, action: 'pause' | 'resume' | 'cancel') => Promise<boolean>;
  onRemove: (id: number) => Promise<boolean>;
  onViewDetails: () => void;
}

export const CustomerRow = memo(function CustomerRow({ 
  item, isSelected, onToggle, onAction, onRemove, onViewDetails 
}: CustomerRowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; type: 'cancel' | 'remove' | null }>({ isOpen: false, type: null });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'expired': return 'bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (isProcessing) return;
    
    if (action === 'cancel') {
        setConfirmDialog({ isOpen: true, type: 'cancel' });
        return;
    }

    setIsProcessing(true);
    await onAction(item.subscription_id, action);
    setIsProcessing(false);
  };

  const handleRemove = async () => {
    if (isProcessing) return;
    setConfirmDialog({ isOpen: true, type: 'remove' });
  };

  const confirmAction = async () => {
    if (isProcessing || !confirmDialog.type) return;
    setIsProcessing(true);
    setConfirmDialog({ isOpen: false, type: null });
    
    if (confirmDialog.type === 'cancel') {
      await onAction(item.subscription_id, 'cancel');
    } else if (confirmDialog.type === 'remove') {
      await onRemove(item.subscription_id);
    }
    
    setIsProcessing(false);
  };

  const isCancellable = item.status === 'active' || item.status === 'paused';
  const isPausable = item.status === 'active';
  const isResumable = item.status === 'paused';

  return (
    <>
      <TableRow className={isProcessing ? "opacity-60" : ""}>
        <TableCell>
          <Checkbox checked={isSelected} onCheckedChange={onToggle} disabled={isProcessing} />
        </TableCell>
        <TableCell>
          <div className="font-medium text-foreground">{item.username}</div>
          <div className="text-sm text-muted-foreground">{item.email}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{item.plan_name}</div>
          <div className="text-xs text-muted-foreground">${item.price} / {item.billing_cycle}</div>
        </TableCell>
        <TableCell>
          <Badge className={getStatusColor(item.status)} variant="secondary">
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {item.start_date ? format(new Date(item.start_date), 'MMM d, yyyy') : '-'}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                <span className="sr-only">Open menu</span>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {(isPausable || isResumable || isCancellable) && <DropdownMenuSeparator />}
              
              {isPausable && (
                <DropdownMenuItem onClick={() => handleAction('pause')} className="cursor-pointer">
                  <PauseCircle className="mr-2 h-4 w-4" /> Pause Subscription
                </DropdownMenuItem>
              )}
              {isResumable && (
                <DropdownMenuItem onClick={() => handleAction('resume')} className="cursor-pointer">
                  <PlayCircle className="mr-2 h-4 w-4" /> Resume Subscription
                </DropdownMenuItem>
              )}
              {isCancellable && (
                <DropdownMenuItem onClick={() => handleAction('cancel')} className="text-destructive cursor-pointer">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Subscription
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRemove} className="text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" /> Remove Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({...prev, isOpen: open}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'cancel' 
                ? "This will cancel the active subscription. This action cannot be undone."
                : "This will permanently remove the customer from your view. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
