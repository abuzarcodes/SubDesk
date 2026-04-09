'use client';

import { useTheme } from './SubscribeThemeProvider';
import { PlanGrid } from './PlanGrid';
import { PlanList } from './PlanList';
import { PlanCard } from './PlanCard';
import { Plan, PublicPageData } from '@/lib/api';

interface PlanSectionProps {
  plans: Plan[];
  businessId: number;
  isPreview?: boolean;
}

export function PlanSection({ plans, businessId, isPreview = false }: PlanSectionProps) {
  const { config } = useTheme();

  if (!config) return null;

  if (plans.length === 0) {
    return (
      <div className="text-center py-16 bg-[color-mix(in_oklch,var(--sub-text)_5%,transparent)] rounded-[var(--sub-radius)] border border-[color-mix(in_oklch,var(--sub-text)_10%,transparent)]">
        <h3 className="text-xl font-bold mb-2">No Plans Available</h3>
        <p className="text-[var(--sub-muted)]">This business hasn't added any subscription plans yet.</p>
      </div>
    );
  }

  const isGrid = config.layout.type === 'grid';

  return (
    <>
      {isGrid ? (
        <PlanGrid columns={config.layout.columns}>
          {plans.map((plan, index) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              index={index}
              config={config.components}
              businessId={businessId}
              isPreview={isPreview}
            />
          ))}
        </PlanGrid>
      ) : (
        <PlanList>
          {plans.map((plan, index) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              index={index}
              config={config.components}
              businessId={businessId}
              isPreview={isPreview}
            />
          ))}
        </PlanList>
      )}
    </>
  );
}
