'use client';

import { Navbar } from '@/components/navbar';
import { Shield, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative pt-24 pb-20 px-4">
        {/* Background blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Shield className="h-3 w-3" />
              <span>Privacy Protection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: April 21, 2026</p>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full -z-10"></div>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12 text-foreground/80 leading-relaxed">
              <section>
                <p className="text-lg">
                  This Privacy Policy explains how Subdesk collects, uses, and protects your information.
                </p>
              </section>

              <hr className="border-border/50" />

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">1</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Information We Collect</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border/50">
                    <h3 className="font-bold text-foreground">A. Account Information</h3>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>Name</li>
                      <li>Email address</li>
                      <li>Login credentials</li>
                    </ul>
                  </div>
                  <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border/50">
                    <h3 className="font-bold text-foreground">B. Business Data</h3>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>Subscription plans</li>
                      <li>Customer data (names, emails)</li>
                      <li>Page configurations</li>
                    </ul>
                  </div>
                  <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border/50">
                    <h3 className="font-bold text-foreground">C. Payment Data</h3>
                    <p className="text-sm">We <strong>DO NOT</strong> store card details. Payments are processed via third-party providers (e.g., Razorpay).</p>
                  </div>
                  <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border/50">
                    <h3 className="font-bold text-foreground">D. Technical Data</h3>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>IP address</li>
                      <li>Browser type</li>
                      <li>Usage logs</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">2</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">How We Use Information</h2>
                </div>
                <p>We use data to:</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Provide and improve the Service",
                    "Manage accounts and subscriptions",
                    "Enable payment integrations",
                    "Communicate updates and support"
                  ].map((use, i) => (
                    <span key={i} className="px-4 py-2 rounded-lg bg-card border border-border/50 text-sm font-medium">
                      {use}
                    </span>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">3</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Data Sharing</h2>
                </div>
                <p>We do <strong>NOT</strong> sell your data.</p>
                <p>We may share data with:</p>
                <ul className="space-y-2 list-inside list-disc">
                  <li>Payment providers (e.g., Razorpay)</li>
                  <li>Hosting providers</li>
                  <li>Legal authorities if required</li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">4</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Data Storage & Security</h2>
                </div>
                <p>We use industry-standard measures to protect data. However, no system is 100% secure.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">5</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Your Rights</h2>
                </div>
                <p>You can:</p>
                <ul className="space-y-2 list-inside list-disc">
                  <li>Access your data</li>
                  <li>Request corrections</li>
                  <li>Request deletion of your account</li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">6</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Cookies</h2>
                </div>
                <p>We may use cookies for authentication, session management, and analytics.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">7</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Third-Party Services</h2>
                </div>
                <p>Subdesk relies on third-party services for payments (Razorpay) and hosting. Their policies may apply separately.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">8</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Data Retention</h2>
                </div>
                <p>We retain data as long as necessary to provide the Service and comply with legal obligations.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">9</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Children’s Privacy</h2>
                </div>
                <p>Subdesk is not intended for users under 18.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">10</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Changes to Policy</h2>
                </div>
                <p>We may update this Privacy Policy. Continued use implies acceptance.</p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">11</span>
                  <h2 className="text-xl font-bold m-0 uppercase tracking-wider text-foreground">Contact</h2>
                </div>
                <p>For questions, please contact us at:</p>
                <p className="font-bold text-lg text-primary">privacy@subdesk.com</p>
              </section>
            </div>
          </div>

          <div className="flex items-center justify-between py-12 border-t border-border">
            <p className="text-sm text-muted-foreground">© 2026 SubDesk. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
