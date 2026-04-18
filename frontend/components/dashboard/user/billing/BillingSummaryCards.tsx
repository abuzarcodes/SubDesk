import React from 'react';
import { StatsCard } from '@/components/dashboard/user/StatsCard';
import { IndianRupee, Wallet } from 'lucide-react';
import { UserBillingSummary } from '@/lib/api';

interface BillingSummaryCardsProps {
  summary: UserBillingSummary | null;
}

export function BillingSummaryCards({ summary }: BillingSummaryCardsProps) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total Spent"
        value={`₹${summary.totalSpent.toLocaleString("en-IN")}`}
        icon={<IndianRupee className="w-5 h-5" />}
      />
      <StatsCard
        title="This Month"
        value={`₹${summary.thisMonth.toLocaleString("en-IN")}`}
        icon={<Wallet className="w-5 h-5" />}
      />
      <StatsCard
        title="Failed Payments"
        value={summary.failedPayments}
        icon={null} // Or another appropriate icon
      />
    </div>
  );
}
