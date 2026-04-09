'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/form-field';
import { toast } from 'sonner';
import type { Role } from '@/lib/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('business');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'business' || roleParam === 'customer') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(username, email, password, role);
      toast.success('Account created successfully!');
      router.push(role === 'business' ? '/dashboard' : '/my-subscriptions');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Create account</h1>
              <p className="text-muted-foreground">Join SubTrckr today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="I am a...">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={role === 'business' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setRole('business')}
                  >
                    Business
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'customer' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setRole('customer')}
                  >
                    Customer
                  </Button>
                </div>
              </FormField>

              <FormField label="Full Name" error={errors.username}>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-card"
                />
              </FormField>

              <FormField label="Email" error={errors.email}>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-card"
                />
              </FormField>

              <FormField label="Password" error={errors.password}>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-card"
                />
              </FormField>

              <Button
                type="submit"
                className="w-full h-10"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
