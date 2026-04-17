'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import type { Plan } from '@/lib/api';

interface PlanFormProps {
  onSubmit: (data: Partial<Plan>) => Promise<void>;
  initialPlan?: Plan;
  isLoading?: boolean;
}

export function PlanForm({ onSubmit, initialPlan, isLoading = false }: PlanFormProps) {
  const [name, setName] = useState(initialPlan?.name || '');
  const [price, setPrice] = useState(initialPlan?.price?.toString() || '');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    initialPlan?.billing_cycle || 'monthly'
  );
  const [description, setDescription] = useState(initialPlan?.description || '');
  const [discount, setDiscount] = useState(initialPlan?.discount?.toString() || '0');
  const [features, setFeatures] = useState<string[]>(initialPlan?.features || ['']);
  const [benefitsAvailable, setBenefitsAvailable] = useState<string[]>(
    initialPlan?.benefits_available || ['']
  );
  const [benefitsNotAvailable, setBenefitsNotAvailable] = useState<string[]>(
    initialPlan?.benefits_not_available || ['']
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = 'Plan name is required';
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Price must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit({
        name,
        price: Number(price),
        billing_cycle: billingCycle,
        description,
        discount: Number(discount),
        features: features.filter(f => f.trim() !== ''),
        benefits_available: benefitsAvailable.filter(b => b.trim() !== ''),
        benefits_not_available: benefitsNotAvailable.filter(b => b.trim() !== ''),
      });
      
      if (!initialPlan) {
        setName('');
        setPrice('');
        setBillingCycle('monthly');
        setDescription('');
        setDiscount('0');
        setFeatures(['']);
        setBenefitsAvailable(['']);
        setBenefitsNotAvailable(['']);
      }
      setErrors({});
    } catch {
      // Error is handled by parent component
    }
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">

      <FormField label="Plan Name" error={errors.name}>
        <Input
          type="text"
          placeholder="e.g., Professional Plan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10"
        />
      </FormField>

      <FormField label="Price (INR)" error={errors.price}>
        <Input
          type="number"
          placeholder="499"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="1"
          min="0"
          className="h-10"
        />
      </FormField>

      <FormField label="Billing Cycle">
        <Select value={billingCycle} onValueChange={(value: any) => setBillingCycle(value)}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Description">
        <Textarea
          placeholder="Describe your plan..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </FormField>

      <FormField label="Discount (%)">
        <Input
          type="number"
          placeholder="0"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          min="0"
          max="100"
          className="h-10"
        />
      </FormField>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Features</label>
          <Button type="button" variant="outline" size="sm" onClick={() => addItem(setFeatures)}>
            <Plus className="h-4 w-4 mr-1" /> Add Feature
          </Button>
        </div>
        {features.map((feature, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={feature}
              onChange={(e) => updateItem(setFeatures, index, e.target.value)}
              placeholder="e.g., 24/7 Support"
              className="h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(setFeatures, index)}
              className="h-9 w-9 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Benefits Included</label>
          <Button type="button" variant="outline" size="sm" onClick={() => addItem(setBenefitsAvailable)}>
            <Plus className="h-4 w-4 mr-1" /> Add Benefit
          </Button>
        </div>
        {benefitsAvailable.map((benefit, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={benefit}
              onChange={(e) => updateItem(setBenefitsAvailable, index, e.target.value)}
              placeholder="e.g., Cloud Sync"
              className="h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(setBenefitsAvailable, index)}
              className="h-9 w-9 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Not Included</label>
          <Button type="button" variant="outline" size="sm" onClick={() => addItem(setBenefitsNotAvailable)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {benefitsNotAvailable.map((benefit, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={benefit}
              onChange={(e) => updateItem(setBenefitsNotAvailable, index, e.target.value)}
              placeholder="e.g., Enterprise API"
              className="h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(setBenefitsNotAvailable, index)}
              className="h-9 w-9 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (initialPlan ? 'Updating...' : 'Creating...') : initialPlan ? 'Update Plan' : 'Create Plan'}
      </Button>
    </form>
  );
}
