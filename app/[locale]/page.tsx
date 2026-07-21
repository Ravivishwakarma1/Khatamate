'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  MessageCircle,
  BarChart3,
  WifiOff,
  Globe,
  Shield,
  ArrowRight,
  Check,
  TrendingUp,
  Sparkles,
  Star,
  Quote
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import LegalModal, { LegalDocType } from '@/components/modals/LegalModal';
import styles from './landing/landing.module.css';

export default function LandingPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocType | null>(null);

  return (
    <div className={styles.page}>
      {/* Background Orbs */}
      <div className={styles.orbPrimary} />
      <div className={styles.orbAccent} />

      {/* Navbar */}
      <LandingNavbar locale={locale} />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={14} /> Next-Gen Digital Ledger for Small Businesses
        </div>

        <h1 className={styles.title}>
          Master Your Business Credit with <span className={styles.gradientText}>KhataFlow</span>
        </h1>

        <p className={styles.subtitle}>
          Track Udhar (credit) & Jama (payments), send instant automated WhatsApp reminders, work 100% offline, and eliminate bad debt effortlessly.
        </p>

        <div className={styles.ctaGroup}>
          <Link href={`/${locale}/register`} className={`btn btn-accent ${styles.ctaPrimary}`}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <Link href={`/${locale}/login`} className="btn btn-secondary" style={{ padding: '16px 28px' }}>
            Existing Store Login
          </Link>
          <Link href={`/${locale}/dashboard`} className="btn btn-coral" style={{ padding: '16px 28px' }}>
            Open Ledger App <ArrowRight size={18} />
          </Link>
        </div>

        {/* Hero Interactive Preview Component */}
        <div className={styles.heroPreview}>
          <div className={styles.previewCard}>
            <div className={styles.statWidget}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                <span>Total Receivables</span>
                <span className="text-accent" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12} /> +12.4%</span>
              </div>
              <div className="amount-xl amount-negative">₹1,42,850</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>Across 48 active accounts</div>
            </div>

            <div className={styles.statWidget}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                <span>Collected Today</span>
                <span className="text-accent">Jama</span>
              </div>
              <div className="amount-xl amount-positive">₹18,500</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>Via UPI & Cash payment</div>
            </div>

            <div className={styles.statWidget}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                <span>WhatsApp Reminders</span>
                <span className="text-gold">Sent</span>
              </div>
              <div className="amount-xl text-primary">14 Sent</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>82% paid within 24h</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything Your Shop Needs</h2>
          <p className={styles.sectionSub}>Built specifically for Kirana stores, wholesalers, & local service providers.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrap}>
              <BookOpen size={28} />
            </div>
            <h3 className={styles.featureTitle}>Digital Ledger</h3>
            <p className={styles.featureDesc}>
              Say goodbye to paper notebooks. Record credits and payments in seconds with clean PDF statements.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrap} style={{ background: 'rgba(0, 201, 167, 0.15)', borderColor: 'rgba(0, 201, 167, 0.3)', color: 'var(--accent)' }}>
              <MessageCircle size={28} />
            </div>
            <h3 className={styles.featureTitle}>1-Click WhatsApp Reminders</h3>
            <p className={styles.featureDesc}>
              Send polite, automated payment reminder links with UPI payment options directly on WhatsApp.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrap} style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)', color: 'var(--gold)' }}>
              <WifiOff size={28} />
            </div>
            <h3 className={styles.featureTitle}>Offline First Engine</h3>
            <p className={styles.featureDesc}>
              No internet? No problem. Record transactions anytime offline — it syncs automatically when online.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrap}>
              <BarChart3 size={28} />
            </div>
            <h3 className={styles.featureTitle}>Business Analytics</h3>
            <p className={styles.featureDesc}>
              Visual breakdown of credit vs collection trends, top debtors, and cashflow reports.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrap} style={{ background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)', color: 'var(--coral)' }}>
              <Globe size={28} />
            </div>
            <h3 className={styles.featureTitle}>8 Regional Languages</h3>
            <p className={styles.featureDesc}>
              Available in English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), and more.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrap}>
              <Shield size={28} />
            </div>
            <h3 className={styles.featureTitle}>Bank-Grade Security</h3>
            <p className={styles.featureDesc}>
              End-to-end cloud backups, custom app PIN lock, and zero data loss guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Get Started in 3 Simple Steps</h2>
          <p className={styles.sectionSub}>No complicated setup required. Be up and running in under 2 minutes.</p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>Create Your Store Account</h3>
            <p className={styles.featureDesc}>Sign up with your phone or Google account and name your business.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>Add Customers & Credit</h3>
            <p className={styles.featureDesc}>Add customer contacts and log their existing balance or new purchases.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>Collect Payments 3x Faster</h3>
            <p className={styles.featureDesc}>Send WhatsApp reminders with QR codes and record instant payments.</p>
          </div>
        </div>
      </section>

      {/* Testimonials / Reviews Section */}
      <section id="testimonials" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Trusted by 10,000+ Shop Owners</h2>
          <p className={styles.sectionSub}>See how KhataFlow helps local merchants collect payments faster.</p>
        </div>


        <div className={styles.grid}>
          <div className={styles.featureCard}>
            <div style={{ display: 'flex', gap: '4px', color: 'var(--gold)', marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--gold)" />)}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5 }}>
              "KhataFlow changed my Kirana shop completely. I collected ₹42,000 of old pending credit in just 2 weeks using the WhatsApp reminder link!"
            </p>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Suresh Patel</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Laxmi Provision Store, Gujarat</div>
          </div>

          <div className={styles.featureCard}>
            <div style={{ display: 'flex', gap: '4px', color: 'var(--gold)', marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--gold)" />)}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5 }}>
              "The itemized grocery billing feature is fantastic! Customers get clear WhatsApp slips with their exact item list and total balance."
            </p>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rajesh Sharma</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sharma Supermarket, Delhi</div>
          </div>

          <div className={styles.featureCard}>
            <div style={{ display: 'flex', gap: '4px', color: 'var(--gold)', marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--gold)" />)}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5 }}>
              "Managing multiple shop branches under one profile saved me hours of ledger calculations every single evening!"
            </p>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Anand K.</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>City Wholesale Traders, Bangalore</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
          <p className={styles.sectionSub}>Start 100% free with unlimited customers.</p>
        </div>

        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Free Forever</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Ideal for small single-store businesses</p>
            </div>
            <div className={styles.price}>₹0 <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>/ month</span></div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}><Check size={18} /> Unlimited Customers</li>
              <li className={styles.featureItem}><Check size={18} /> Offline Mode & Sync</li>
              <li className={styles.featureItem}><Check size={18} /> Manual WhatsApp Reminders</li>
              <li className={styles.featureItem}><Check size={18} /> PDF Account Statements</li>
            </ul>

            <Link href={`/${locale}/register`} className="btn btn-secondary" style={{ width: '100%' }}>
              Get Started Free
            </Link>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingPro}`}>
            <div className={styles.popularBadge}>RECOMMENDED</div>
            <div>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>KhataFlow Pro</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>For growing businesses needing automation</p>
            </div>
            <div className={styles.price}>₹199 <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>/ month</span></div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}><Check size={18} /> Everything in Free</li>
              <li className={styles.featureItem}><Check size={18} /> Automated Daily WhatsApp Reminders</li>
              <li className={styles.featureItem}><Check size={18} /> Multi-Staff Access & Roles</li>
              <li className={styles.featureItem}><Check size={18} /> Custom QR Code Payment Printing</li>
              <li className={styles.featureItem}><Check size={18} /> Advanced Financial Analytics</li>
            </ul>

            <Link href={`/${locale}/register`} className="btn btn-accent" style={{ width: '100%' }}>
              Start 14-Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerCol}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: 'var(--text-xl)' }}>
            <BookOpen size={24} className="text-primary" /> Khata<span className="text-accent">Flow</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
            Empowering local businesses across India & beyond with smart digital credit tracking.
          </p>
        </div>

        <div className={styles.footerCol}>
          <div className={styles.footerTitle}>Product</div>
          <a href="#features" className={styles.footerLink}>Features</a>
          <a href="#how-it-works" className={styles.footerLink}>How It Works</a>
          <a href="#testimonials" className={styles.footerLink}>Reviews</a>
          <a href="#pricing" className={styles.footerLink}>Pricing</a>
        </div>

        <div className={styles.footerCol}>
          <div className={styles.footerTitle}>Account & App</div>
          <Link href={`/${locale}/login`} className={styles.footerLink}>Sign In</Link>
          <Link href={`/${locale}/register`} className={styles.footerLink}>Create Account</Link>
          <Link href={`/${locale}/dashboard`} className={styles.footerLink}>Open Ledger App</Link>
          <Link href={`/${locale}/onboarding`} className={styles.footerLink}>Store Setup</Link>
        </div>

        <div className={styles.footerCol}>
          <div className={styles.footerTitle}>Legal & Security</div>
          <button onClick={() => setActiveLegalModal('privacy')} className={styles.footerLink} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
            Privacy Policy
          </button>
          <button onClick={() => setActiveLegalModal('terms')} className={styles.footerLink} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
            Terms of Service
          </button>
          <button onClick={() => setActiveLegalModal('security')} className={styles.footerLink} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
            Bank-Grade Security
          </button>
        </div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} KhataFlow Inc. All rights reserved.
        </div>
      </footer>

      {activeLegalModal && (
        <LegalModal
          type={activeLegalModal}
          onClose={() => setActiveLegalModal(null)}
        />
      )}
    </div>
  );
}
