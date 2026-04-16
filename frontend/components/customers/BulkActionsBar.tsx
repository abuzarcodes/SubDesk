import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomerItem } from '@/lib/api';
import { Trash2, XCircle, Loader2 } from 'lucide-react';
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

interface BulkActionsBarProps {
  selectedIds: Set<number>;
  data: CustomerItem[];
  onAction: (id: number, action: 'pause' | 'resume' | 'cancel') => Promise<boolean>;
  onRemove: (id: number) => Promise<boolean>;
  onClearSelection: () => void;
  onError: (msg: string) => void;
}

export function BulkActionsBar({ 
  selectedIds, data, onAction, onRemove, onClearSelection, onError 
}: BulkActionsBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; type: 'cancel' | 'remove' | null }>({ isOpen: false, type: null });

  if (selectedIds.size === 0) return null;

  const count = selectedIds.size;
  const selectedItems = data.filter(d => selectedIds.has(d.subscription_id));
  
  const hasCancellable = selectedItems.some(i => i.status === 'active' || i.status === 'paused');

  const handleBulkCancel = async () => {
    setIsProcessing(true);
    let successCount = 0;
    
    const toCancel = selectedItems.filter(i => i.status === 'active' || i.status === 'paused');
    
    for (const item of toCancel) {
      try {
        const ok = await onAction(item.subscription_id, 'cancel');
        if (ok) successCount++;
      } catch (err) {
        // Continue tracking success count
      }
    }
    
    if (successCount < toCancel.length) {
      onError(`Failed to cancel some subscriptions. (${successCount}/${toCancel.length} succeeded)`);
    }
    
    setIsProcessing(false);
    onClearSelection();
    setConfirmDialog({ isOpen: false, type: null });
  };

  const handleBulkRemove = async () => {
    setIsProcessing(true);
    let successCount = 0;
    
    for (const item of selectedItems) {
      try {
        const ok = await onRemove(item.subscription_id);
        if (ok) successCount++;
      } catch (err) {
        // silently handle and count
      }
    }
    
    if (successCount < selectedItems.length) {
      onError(`Failed to remove some customers. (${successCount}/${selectedItems.length} succeeded)`);
    }
    
    setIsProcessing(false);
    onClearSelection();
    setConfirmDialog({ isOpen: false, type: null });
  };

  return (
    <>
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
        <div className="text-sm font-medium text-foreground">
          {count} {count === 1 ? 'customer' : 'customers'} selected
        </div>
        <div className="flex items-center gap-2">
          {hasCancellable && (
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isProcessing}
              className="text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-900/50"
              onClick={() => setConfirmDialog({ isOpen: true, type: 'cancel' })}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Selected
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isProcessing}
            className="text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={() => setConfirmDialog({ isOpen: true, type: 'remove' })}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={isProcessing}>
            Clear
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({...prev, isOpen: open}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'cancel' 
                ? `This will cancel ${selectedItems.filter(i => i.status === 'active' || i.status === 'paused').length} active/paused subscriptions. This action cannot be undone.`
                : `This will permanently remove ${count} customers from your view. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDialog.type === 'cancel' ? handleBulkCancel : handleBulkRemove} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
