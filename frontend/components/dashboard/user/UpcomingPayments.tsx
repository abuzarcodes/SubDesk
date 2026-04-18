import React from 'react';

interface UpcomingPaymentsProps {
  payments: Array<{
    id: number;
    name: string;
    price: number;
    expires_at: string | null;
  }>;
}

export function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 md:p-6 pb-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Upcoming Payments</h3>
        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium">
          Next 5
        </span>
      </div>
      <div className="flex-1 p-0">
        {payments.length === 0 ? (
          <div className="text-muted-foreground text-sm italic p-6 text-center">No upcoming payments soon.</div>
        ) : (
          <div className="divide-y divide-border flex flex-col">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center py-3 px-4 md:px-6 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm text-foreground">{payment.name}</span>
                  {payment.expires_at && (
                    <span className="text-xs text-muted-foreground/70 mt-1">
                      Due: {new Date(payment.expires_at).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-sm text-foreground">
                  ₹{payment.price.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
