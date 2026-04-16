import { BarChart3, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your subscription metrics and growth
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center text-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Detailed analytics and insights are on the way. Track revenue, subscriber growth, churn rate, and more.
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground/60">
          <Clock className="h-3.5 w-3.5" />
          Under development
        </div>
      </div>
    </div>
  );
}
