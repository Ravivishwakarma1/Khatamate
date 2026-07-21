'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Menu, X } from 'lucide-react';
import styles from './LandingNavbar.module.css';

export function LandingNavbar({ locale }: { locale: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <Link href={`/${locale}`} className={styles.brand}>
        <div className={styles.logoIcon}>
          <BookOpen size={22} />
        </div>
        <span>Khata<span className="text-accent">Mate</span></span>
      </Link>


      <nav className={styles.navLinks}>
        <a href="#features" className={styles.navLink}>Features</a>
        <a href="#how-it-works" className={styles.navLink}>How It Works</a>
        <a href="#pricing" className={styles.navLink}>Pricing</a>
        <a href="#testimonials" className={styles.navLink}>Reviews</a>
      </nav>

      <div className={styles.actions}>
        <Link href={`/${locale}/login`} className="btn btn-ghost">
          Sign In
        </Link>
        <Link href={`/${locale}/register`} className="btn btn-accent">
          Get Started <ArrowRight size={16} />
        </Link>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
