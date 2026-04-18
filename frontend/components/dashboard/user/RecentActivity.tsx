import React from 'react';

interface RecentActivityProps {
  activity: Array<{
    event_type: string;
    created_at: string;
    plan_name: string;
  }>;
}

const mapEventType = (type: string, plan: string) => {
  switch (type.toLowerCase()) {
    case 'created':
      return `Subscribed to ${plan}`;
    case 'paused':
      return `Paused ${plan}`;
    case 'resumed':
      return `Resumed ${plan}`;
    case 'cancelled':
      return `Cancelled ${plan}`;
    default:
      return `${type} - ${plan}`;
  }
};

const getEventIconOptions = (type: string) => {
  switch (type.toLowerCase()) {
    case 'created':
    case 'resumed':
      return 'bg-primary/20 text-primary border-background';
    case 'paused':
      return 'bg-secondary text-secondary-foreground border-background';
    case 'cancelled':
      return 'bg-destructive/20 text-destructive border-background';
    default:
      return 'bg-muted text-muted-foreground border-background';
  }
};

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm md:col-span-2 lg:col-span-3">
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
      </div>
      <div className="p-4 md:p-6">
        {activity.length === 0 ? (
          <div className="text-muted-foreground text-sm italic py-2 text-center">No recent activity.</div>
        ) : (
          <div className="flex flex-col relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border"></div>
            {activity.slice(0, 5).map((event, index) => (
              <div key={index} className="flex gap-4 py-3 relative z-10">
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${getEventIconOptions(event.event_type)}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {mapEventType(event.event_type, event.plan_name)}
                  </span>
                  <span className="text-[13px] text-muted-foreground mt-0.5">
                    {new Date(event.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
