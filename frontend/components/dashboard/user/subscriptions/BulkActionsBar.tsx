import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserSubscriptionItem } from '@/lib/api';
import { PauseCircle, XCircle, Loader2 } from 'lucide-react';
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
  data: UserSubscriptionItem[];
  onBulkAction: (ids: number[], action: 'pause' | 'cancel') => Promise<boolean>;
  onClearSelection: () => void;
  onError: (msg: string) => void;
}

export function BulkActionsBar({ 
  selectedIds, data, onBulkAction, onClearSelection, onError 
}: BulkActionsBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; type: 'pause' | 'cancel' | null }>({ isOpen: false, type: null });

  if (selectedIds.size === 0) return null;

  const count = selectedIds.size;
  const selectedItems = data.filter(d => selectedIds.has(d.id));
  
  const hasPausable = selectedItems.some(i => i.status === 'active');
  const hasCancellable = selectedItems.some(i => i.status === 'active' || i.status === 'paused');

  const handleAction = async () => {
    if (!confirmDialog.type) return;
    const action = confirmDialog.type;
    
    setIsProcessing(true);
    try {
       const ids = Array.from(selectedIds);
       await onBulkAction(ids, action);
       setConfirmDialog({ isOpen: false, type: null });
    } catch (err: any) {
       onError(err.message || `Failed to ${action} some subscriptions.`);
    } finally {
       setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
        <div className="text-sm font-medium text-foreground">
          {count} {count === 1 ? 'subscription' : 'subscriptions'} selected
        </div>
        <div className="flex items-center gap-2">
          {hasPausable && (
             <Button 
               variant="outline" 
               size="sm" 
               disabled={isProcessing}
               className="text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-900/50"
               onClick={() => setConfirmDialog({ isOpen: true, type: 'pause' })}
             >
               <PauseCircle className="h-4 w-4 mr-2" />
               Pause Selected
             </Button>
          )}
          {hasCancellable && (
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isProcessing}
              className="text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={() => setConfirmDialog({ isOpen: true, type: 'cancel' })}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Selected
            </Button>
          )}
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
                ? `This will cancel ${selectedItems.filter(i => i.status === 'active' || i.status === 'paused').length} active/paused subscriptions. You might lose access to features immediately.`
                : `This will pause ${selectedItems.filter(i => i.status === 'active').length} active subscriptions.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Close</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction} 
              disabled={isProcessing}
              className={confirmDialog.type === 'cancel' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
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
