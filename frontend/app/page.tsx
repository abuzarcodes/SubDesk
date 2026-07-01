'use client';

import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowRight, CheckCircle2, PlayCircle, Smartphone, 
  Settings2, CreditCard, Database, Zap, Users, 
  MessageCircle, FileSpreadsheet, AlertCircle, RefreshCw,
  MousePointer2, Crown, UserCircle2,
  Activity
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    if (user) {
      if (user.role === 'business') {
        router.push('/dashboard');
      } else {
        router.push('/my-subscriptions');
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="overflow-hidden">
        {/* 1. HERO SECTION */}
        <section className="relative px-4 pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="absolute top-0 w-full h-[500px] bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10 bg-[size:24px_24px]" style={{ maskImage: 'linear-gradient(to bottom, white, transparent)' }}></div>

          <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/15 transition-colors">
              <Zap className="h-4 w-4" />
              <span>Launch a subscription business in minutes</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl leading-tight">
              Create a subscription page and <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">collect payments</span> in minutes.
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-light">
              No code, no websites. Just generate a hosted page, share your link, and start managing recurring revenue instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <Link href="/register?role=business" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                  Create Your Page <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg gap-2 rounded-full border-border hover:bg-muted/50 transition-all">
                  <PlayCircle className="h-5 w-5 text-muted-foreground" />
                  Try Live Demo
                </Button>
              </Link>
            </div>

            {/* Hero Visual Mockup */}
            <div className="mt-16 w-full max-w-5xl relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl shadow-black/5 p-2 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 top-1/2"></div>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="mx-auto bg-background/50 border border-border/50 rounded-md px-32 py-1 text-xs text-muted-foreground flex items-center gap-2">
                  <Settings2 className="w-3 h-3" /> subdesk.com/your-business
                </div>
              </div>
              <div className="grid grid-cols-3 h-[400px]">
                <div className="col-span-1 border-r border-border/50 bg-muted/10 p-6 flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="h-4 w-32 bg-primary/20 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-8 w-full bg-background border border-border/50 rounded-md"></div>
                      <div className="h-8 w-full bg-background border border-border/50 rounded-md"></div>
                      <div className="h-8 w-full bg-primary/10 border border-primary/20 rounded-md"></div>
                    </div>
                  </div>
                  <div className="mt-auto h-12 w-full bg-primary rounded-md flex items-center justify-center text-primary-foreground font-medium text-sm gap-2">
                    <RefreshCw className="w-4 h-4" /> Publish Changes
                  </div>
                </div>
                <div className="col-span-2 bg-background p-8 relative">
                   <div className="absolute right-8 top-8 w-6 h-6 animate-bounce">
                     <MousePointer2 className="w-6 h-6 text-primary fill-primary/20" />
                   </div>
                   <div className="max-w-sm mx-auto mt-10 space-y-6 text-center">
                     <div className="w-20 h-20 bg-muted rounded-full mx-auto"></div>
                     <div className="space-y-2">
                       <div className="h-6 w-48 bg-foreground/90 rounded-full mx-auto"></div>
                       <div className="h-4 w-64 bg-muted-foreground/50 rounded-full mx-auto"></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-8">
                       <div className="h-32 border-2 border-primary/20 bg-primary/5 rounded-xl"></div>
                       <div className="h-32 border border-border bg-card rounded-xl"></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROBLEM SECTION */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Most businesses still manage subscriptions like this</h2>
              <p className="text-muted-foreground text-lg">It's chaotic, unscalable, and costs you real money.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-card p-6 rounded-2xl border border-destructive/10 shadow-sm relative overflow-hidden group hover:border-destructive/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <MessageCircle className="w-8 h-8 text-destructive/70 mb-4" />
                <h3 className="font-semibold mb-2">WhatsApp Chaos</h3>
                <p className="text-sm text-muted-foreground">Chasing clients for monthly screenshots of payment transfers.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-amber-500/10 shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <FileSpreadsheet className="w-8 h-8 text-amber-500/70 mb-4" />
                <h3 className="font-semibold mb-2">Google Sheets</h3>
                <p className="text-sm text-muted-foreground">Manually updating rows to remember who paid and who expired.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-blue-500/10 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <RefreshCw className="w-8 h-8 text-blue-500/70 mb-4" />
                <h3 className="font-semibold mb-2">Manual Renewals</h3>
                <p className="text-sm text-muted-foreground">Remembering to message customers exactly 30 days later.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-red-500/10 shadow-sm relative overflow-hidden group hover:border-red-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <AlertCircle className="w-8 h-8 text-red-500/70 mb-4" />
                <h3 className="font-semibold mb-2">Lost Payments</h3>
                <p className="text-sm text-muted-foreground">Awkward conversations and churn because billing isn't automated.</p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-block bg-background border border-border px-8 py-4 rounded-2xl shadow-sm">
                <p className="text-xl font-medium">
                  Subdesk replaces all of this with <span className="text-primary font-bold">one simple link.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SOLUTION SECTION */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group rounded-3xl bg-card border border-border p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Smartphone className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Instant Pages</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No website needed. Generate a beautiful, mobile-optimized subscription page in seconds. Ready to accept payments instantly.
                </p>
              </div>

              <div className="group rounded-3xl bg-card border border-border p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Database className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Automated Gen</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Say goodbye to spreadsheets. We automatically manage your plans, process renewals, and track customer lifecycles.
                </p>
              </div>

              <div className="group rounded-3xl bg-card border border-border p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Settings2 className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Fully Customizable</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Match your brand perfectly. Change themes, colors, and layout components without writing a single line of code.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. LIVE BUILDER DEMO SECTION */}
        <section id="demo" className="py-24 bg-foreground text-background overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black pointer-events-none"></div>
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Change anything → <span className="text-primary">see it instantly</span></h2>
                <p className="text-neutral-400 text-lg mb-8 max-w-md">
                  Our real-time editor updates your live page in roughly 150ms. Tweak your pricing, adjust the layout, and launch with confidence.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> One-click theme toggling
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> Drag-and-drop plan ordering
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> Live payment preview
                  </div>
                </div>
                <div className="mt-10">
                  <Button size="lg" variant="secondary" className="gap-2 h-14 px-8 rounded-full font-medium" onClick={() => setActiveTheme(t => t === 'light' ? 'dark' : 'light')}>
                    <RefreshCw className="h-4 w-4" /> Play with Demo
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className={`relative rounded-2xl border border-neutral-700 overflow-hidden shadow-2xl transition-colors duration-500 ${activeTheme === 'dark' ? 'bg-neutral-950' : 'bg-white'}`}>
                  <div className="flex border-b border-neutral-700/50 bg-neutral-900 px-4 py-3 items-center justify-between">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
                       <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
                       <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
                    </div>
                    <div className="text-xs text-neutral-500 font-mono">Editor Preview</div>
                  </div>
                  <div className="p-8">
                    <div className="max-w-xs mx-auto text-center space-y-6">
                      <div className={`w-16 h-16 rounded-2xl mx-auto ${activeTheme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'} flex items-center justify-center transition-colors`}>
                        <Crown className={`w-8 h-8 ${activeTheme === 'dark' ? 'text-primary' : 'text-primary'} transition-colors`} />
                      </div>
                      <h3 className={`text-2xl font-bold transition-colors ${activeTheme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>Premium Access</h3>
                      <div className={`space-y-3 ${activeTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${activeTheme === 'dark' ? 'border-primary bg-primary/10' : 'border-primary bg-primary/5'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-primary">Monthly</span>
                            <span className={`font-bold ${activeTheme === 'dark' ? 'text-white' : 'text-black'}`}>$29</span>
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl border transition-all cursor-pointer ${activeTheme === 'dark' ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Yearly</span>
                            <span className={`font-bold ${activeTheme === 'dark' ? 'text-white' : 'text-black'}`}>$290</span>
                          </div>
                        </div>
                      </div>
                      <div className={`h-12 w-full rounded-lg ${activeTheme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center font-medium transition-colors`}>
                        Subscribe Now
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. WHO IS IT FOR */}
        <section className="py-24 bg-muted/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built for your business</h2>
              <p className="text-muted-foreground text-lg">Whether you have 10 or 10,000 subscribers.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center group hover:border-primary/50 transition-colors">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Coaches & Trainers</h3>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center group hover:border-primary/50 transition-colors">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Gyms & Fitness</h3>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center group hover:border-primary/50 transition-colors">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Freelancers</h3>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center group hover:border-primary/50 transition-colors">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Subscription Services</h3>
              </div>
            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works</h2>
              <p className="text-muted-foreground text-lg">From zero to getting paid in under 2 minutes.</p>
            </div>
            
            <div className="relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-border via-primary/50 to-border -translate-y-1/2 z-0"></div>
              
              <div className="grid md:grid-cols-3 gap-12 relative z-10">
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-background border-2 border-border group-hover:border-primary rounded-full flex items-center justify-center text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors shadow-sm mb-6 bg-card relative">
                    1
                    <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500 z-[-1]"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Create page</h3>
                  <p className="text-muted-foreground text-sm">Sign up and instantly generate your customizable hosted page.</p>
                </div>
                
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-background border-2 border-border group-hover:border-primary rounded-full flex items-center justify-center text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors shadow-sm mb-6 bg-card relative">
                    2
                    <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500 z-[-1]"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Add plans</h3>
                  <p className="text-muted-foreground text-sm">Define your monthly or yearly pricing and features in seconds.</p>
                </div>
                
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-primary text-primary-foreground border-2 border-primary rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30 mb-6 relative">
                    3
                    <div className="absolute inset-0 bg-primary/20 rounded-full scale-100 animate-ping z-[-1]"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Share link & get paid</h3>
                  <p className="text-muted-foreground text-sm">Drop your link on Instagram, WhatsApp, or email. Start collecting instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PRICING TEASER */}
        <section className="py-24 bg-muted/40 border-y border-border/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-primary font-medium text-lg mb-12 bg-primary/10 inline-block px-4 py-1.5 rounded-full">Start free. Pay only when you earn.</p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-card rounded-3xl p-8 border border-border shadow-sm text-left">
                <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
                <div className="text-4xl font-extrabold mb-6">5% <span className="text-base font-normal text-muted-foreground">transaction fee</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Hosted subscription page</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Automated renewals</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Basic analytics</li>
                </ul>
                <Button className="w-full" variant="outline">Start Free</Button>
              </div>
              
              <div className="bg-card rounded-3xl p-8 border-2 border-primary shadow-xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
                <div className="text-4xl font-extrabold mb-6">3% <span className="text-base font-normal text-muted-foreground">transaction fee</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Everything in Free</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Custom branding</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Advanced webhooks</li>
                </ul>
                <Button className="w-full">Upgrade to Pro</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SOCIAL PROOF */}
        <section className="py-20 text-center">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Trusted by early creators & subscription businesses</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
               {/* Decorative brand placeholders */}
               <div className="text-xl font-bold flex items-center gap-2"><Users className="w-6 h-6"/> FitStudio</div>
               <div className="text-xl font-bold flex items-center gap-2"><Settings2 className="w-6 h-6"/> CreatorNode</div>
               <div className="text-xl font-bold flex items-center gap-2"><Database className="w-6 h-6"/> DataBox</div>
               <div className="text-xl font-bold flex items-center gap-2"><Zap className="w-6 h-6"/> FastCoach</div>
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA SECTION */}
        <section className="p-4 md:p-8 mb-8 mt-12">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Start your subscription business today.</h2>
              <p className="text-primary-foreground/80 text-xl max-w-2xl mb-10">Stop wrestling with spreadsheets and manual follow-ups. Launch your page and let Subdesk handle the rest.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/register?role=business" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-10 text-lg rounded-full font-bold shadow-xl shadow-black/10 hover:scale-105 transition-transform">
                    Create Free Page
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg rounded-full text-white border-white/30 hover:bg-white/10 hover:text-white transition-all">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
         <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-sm order-2 md:order-1">
              © {new Date().getFullYear()} Subdesk. All rights reserved.
            </p>
            <div className="flex gap-8 order-1 md:order-2">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">Terms of Service</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">Privacy Policy</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}
