'use client';

import { useState } from 'react';
import { Plan } from '@/lib/api';
import { ComponentsConfig } from '@/lib/theme';
import { Check, X } from 'lucide-react';
import { SubscribeButton } from '@/components/subscribe/SubscribeButton';

interface PlanCardProps {
  plan: Plan;
  index: number;
  config: ComponentsConfig;
  businessId: number;
  isPreview?: boolean;
}

export function PlanCard({ plan, index, config, businessId, isPreview = false }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isPopular = config.highlightPopular === index;
  
  let cardClasses = "relative flex flex-col rounded-[var(--sub-radius)] transition-all duration-300 ease-out overflow-hidden";
  
  if (config.cardStyle === 'solid') {
    cardClasses += " bg-[var(--sub-card)] border border-[color-mix(in_oklch,var(--sub-border)_20%,transparent)] shadow-md";
  } else if (config.cardStyle === 'glass') {
    cardClasses += " bg-[color-mix(in_oklch,var(--sub-card)_70%,transparent)] backdrop-blur-xl border border-[color-mix(in_oklch,var(--sub-text)_10%,transparent)] shadow-sm";
  } else {
    // outlined
    cardClasses += " bg-transparent border-2 border-[var(--sub-text)] shadow-sm";
  }

  // Morphic hover effects
  if (isHovered) {
    cardClasses += " -translate-y-1 scale-[1.02] shadow-xl";
    if (config.cardStyle === 'outlined') {
      cardClasses += " border-[var(--sub-primary)]";
    }
  }

  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? '0 20px 40px -10px color-mix(in_oklch, var(--sub-primary) 20%, transparent)' 
          : 'var(--sub-shadow)',
        borderColor: isPopular && !isHovered ? 'var(--sub-primary)' : undefined,
      }}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 right-0 bg-[var(--sub-primary)] text-[var(--sub-background)] text-xs font-bold px-3 py-1 rounded-bl-lg z-10 transition-transform duration-300 transform origin-top-right">
          MOST POPULAR
        </div>
      )}

      {/* Morphic Background Glow */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[var(--sub-primary)] to-[var(--sub-accent)] opacity-0 transition-opacity duration-500 pointer-events-none"
        style={{ opacity: isHovered ? 0.05 : 0 }}
      />

      <div className="flex-1 space-y-6 p-6 relative z-10">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--sub-text)] to-[color-mix(in_oklch,var(--sub-text)_70%,transparent)]">
            {plan.name}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-[var(--sub-primary)] drop-shadow-sm transition-all duration-300">
              ${Number(plan.price).toFixed(2)}
            </span>
            <span className="text-[var(--sub-muted)] font-medium">/ {plan.billing_cycle}</span>
          </div>
          {plan.description && (
            <p className="text-sm text-[var(--sub-muted)] pt-2 leading-relaxed">{plan.description}</p>
          )}
        </div>

        {(plan.features?.length || plan.benefits_available?.length || plan.benefits_not_available?.length) ? (
          <div className="space-y-4 pt-6 border-t border-[color-mix(in_oklch,var(--sub-text)_10%,transparent)]">
            {plan.features && plan.features.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-[var(--sub-muted)] uppercase tracking-wider">Features</p>
                <ul className="grid gap-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 text-[var(--sub-primary)] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-[var(--sub-text)] leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(plan.benefits_available || plan.benefits_not_available) && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-[var(--sub-muted)] uppercase tracking-wider">Benefits</p>
                <ul className="space-y-2">
                  {plan.benefits_available?.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--sub-primary)_15%,transparent)] text-[var(--sub-primary)] shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-[var(--sub-text)] leading-tight">{b}</span>
                    </li>
                  ))}
                  {plan.benefits_not_available?.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm opacity-60">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--sub-muted)_20%,transparent)] text-[var(--sub-muted)] shrink-0">
                        <X className="h-3 w-3" />
                      </div>
                      <span className="text-[var(--sub-muted)] line-through leading-tight">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      <div className="p-6 pt-0 relative z-10 mt-auto">
        <SubscribeButton 
          planId={plan.id} 
          businessId={businessId} 
          buttonStyle={config.buttonStyle} 
          isPreview={isPreview}
        />
      </div>
    </div>
  );
}
