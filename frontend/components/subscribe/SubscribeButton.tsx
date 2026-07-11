'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ComponentsConfig } from '@/lib/theme';
import { Loader2 } from 'lucide-react';

interface SubscribeButtonProps {
  planId: number;
  businessId: number;
  buttonStyle: ComponentsConfig['buttonStyle'];
  isPreview?: boolean;
}

export function SubscribeButton({ planId, businessId, buttonStyle, isPreview = false }: SubscribeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (isPreview) {
      toast.info('This is a preview. Subscription is disabled.');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can subscribe to plans');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Order
      toast.loading('Initializing payment...', { id: 'payment' });
      const order = await apiClient.createOrder(planId, businessId);

      toast.success('Order created, opening payment gateway...', { id: 'payment' });

      // 2. Dynamically load Razorpay script if not loaded
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Test key
        amount: order.amount,
        currency: order.currency || "INR",
        name: 'SubDesk',
        description: order.plan_name,
        order_id: order.order_id,
        prefill: {
          email: user?.email || "test@example.com",
          contact: "9999999999"
        },
        handler: async function (response: any) {
          try {
            toast.loading('Verifying payment...', { id: 'payment' });
            
            await apiClient.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Payment verified! Activation confirmed soon.', { id: 'payment' });
            router.push('/dashboard');
          } catch (verifyError: any) {
            toast.error(verifyError instanceof Error ? verifyError.message : 'Verification failed.', { id: 'payment' });
          } finally {
            setIsLoading(false);
          }
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled.', { id: 'payment' });
            setIsLoading(false);
          }
        }
      };

      console.log("RAZORPAY OPTIONS:", options);

      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`, { id: 'payment' });
        setIsLoading(false);
      });

      razorpay.open();

    } catch (error: any) {
      if (error?.message?.toLowerCase().includes('already subscribed')) {
        toast.error('You are already subscribed to this plan.', { id: 'payment' });
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to initiate payment', { id: 'payment' });
      }
      setIsLoading(false);
    }
  };

  let btnClasses = "w-full py-3 px-4 flex justify-center items-center font-bold transition-all duration-300 ease-in-out relative overflow-hidden group";
  
  if (buttonStyle === 'rounded') {
    btnClasses += " rounded-lg";
  } else if (buttonStyle === 'pill') {
    btnClasses += " rounded-full";
  } else {
    btnClasses += " rounded-none";
  }

  // Base styling using theme variables
  btnClasses += " bg-[var(--sub-primary)] text-[var(--sub-background)] hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 hover:shadow-lg";

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={btnClasses}
    >
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}>
        Subscribe Now
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
      {/* Subtle hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white/0 via-white to-white/0 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
    </button>
  );
}
