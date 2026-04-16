import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plan } from '@/lib/api';

interface CustomerFiltersProps {
  search: string;
  status: string;
  planId: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onPlanChange: (val: string) => void;
  plans: Plan[];
}

export function CustomerFilters({
  search, status, planId, onSearchChange, onStatusChange, onPlanChange, plans
}: CustomerFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync local if external changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const handleClearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onStatusChange('');
    onPlanChange('');
  };

  const hasActiveFilters = search || status || planId;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
      <div className="flex flex-1 gap-3 w-full sm:w-auto items-center flex-wrap">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search customers by name or email..." 
            className="pl-9 pr-4"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <Select value={status || 'all'} onValueChange={(val) => onStatusChange(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planId || 'all'} onValueChange={(val) => onPlanChange(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {plans.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={handleClearFilters} className="h-9 w-9 shrink-0" title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
