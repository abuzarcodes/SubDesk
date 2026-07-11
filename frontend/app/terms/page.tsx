'use client';

import { Navbar } from '@/components/navbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative pt-24 pb-20 px-4">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <FileText className="h-3 w-3" />
              <span>Legal Document</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground">Last Updated: April 21, 2026</p>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12 text-foreground/80 leading-relaxed">
              <section>
                <p className="text-lg">
                  Welcome to Subdesk. By accessing or using Subdesk (“Service”), you agree to these Terms of Service (“Terms”).
                </p>
                <p className="font-medium text-destructive mt-4">
                  If you do not agree, do not use the Service.
                </p>
              </section>

              <hr className="border-border/50" />

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">1</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Description of Service</h2>
                </div>
                <p>Subdesk provides a platform that allows businesses to:</p>
                <ul className="grid sm:grid-cols-2 gap-3 list-none p-0">
                  <li className="flex items-center gap-2 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Create subscription plans
                  </li>
                  <li className="flex items-center gap-2 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Generate hosted subscription pages
                  </li>
                  <li className="flex items-center gap-2 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Manage customers and subscriptions
                  </li>
                  <li className="flex items-center gap-2 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Integrate with third-party payment providers
                  </li>
                </ul>
                <p className="p-4 bg-primary/5 border border-primary/10 rounded-2xl italic text-sm text-primary-foreground/70">
                  Subdesk is a software platform and does NOT act as a financial institution, payment processor, or escrow service.
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">2</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Eligibility</h2>
                </div>
                <p>You must:</p>
                <ul className="space-y-2 list-inside list-disc">
                  <li>Be at least 18 years old</li>
                  <li>Provide accurate information</li>
                  <li>Use the Service for lawful purposes only</li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">3</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">User Responsibilities</h2>
                </div>
                <p>You are solely responsible for:</p>
                <ul className="grid sm:grid-cols-2 gap-4 list-none p-0">
                  {[
                    "Your business operations",
                    "The content on your subscription pages",
                    "Pricing, plans, and offerings",
                    "Compliance with applicable laws and taxes",
                    "Customer disputes and refunds"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card">
                      <span className="text-primary font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-foreground">You agree NOT to:</p>
                <ul className="space-y-2 list-inside list-disc">
                  <li>Use the Service for illegal activities</li>
                  <li>Mislead customers</li>
                  <li>Attempt to breach system security</li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">4</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Payments</h2>
                </div>
                <p>Subdesk integrates with third-party payment providers such as Razorpay.</p>
                <div className="p-6 rounded-2xl bg-muted/50 border border-border/50 space-y-4">
                  <p className="font-bold text-foreground">Important:</p>
                  <ul className="space-y-2 list-none p-0">
                    <li className="flex gap-2"><span>•</span> All payments are processed directly between you and your customers</li>
                    <li className="flex gap-2"><span>•</span> Subdesk does NOT store or process card/payment details</li>
                    <li className="flex gap-2"><span>•</span> Subdesk does NOT hold funds</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">5</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Fees</h2>
                </div>
                <p>Subdesk may charge transaction fees and subscription fees for premium plans. All fees will be clearly communicated and are non-refundable unless stated otherwise.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">6</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Account & Security</h2>
                </div>
                <p>You are responsible for maintaining account security and keeping login credentials confidential. Subdesk is not liable for unauthorized access due to user negligence.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">7</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Service Availability</h2>
                </div>
                <p>We aim to provide reliable service but do not guarantee uninterrupted uptime or error-free operation. We may modify or discontinue features at any time.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">8</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Termination</h2>
                </div>
                <p>We may suspend or terminate accounts if Terms are violated or illegal activity is detected. You may stop using the Service at any time.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">9</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Limitation of Liability</h2>
                </div>
                <p className="p-4 rounded-xl bg-destructive/5 text-destructive border border-destructive/10 font-bold uppercase tracking-widest text-center">
                  Subdesk is provided “as is”
                </p>
                <p>We are NOT liable for business losses, payment failures from third-party providers, customer disputes, or data loss beyond reasonable control.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">10</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Intellectual Property</h2>
                </div>
                <p>All platform software, design, and branding belong to Subdesk. You retain ownership of your content.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">11</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Changes to Terms</h2>
                </div>
                <p>We may update these Terms at any time. Continued use of the Service implies acceptance.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">12</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Contact</h2>
                </div>
                <p>For questions, please contact us at:</p>
                <p className="font-bold text-lg text-primary">support@subdesk.com</p>
              </section>
            </div>
          </div>

          <div className="flex items-center justify-between py-12 border-t border-border">
            <p className="text-sm text-muted-foreground">© 2026 SubDesk. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
