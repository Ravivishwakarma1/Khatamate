'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, BarChart3, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tNav = useTranslations('nav');

  const navItems = [
    { label: tNav('dashboard'), href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { label: tNav('customers'), href: `/${locale}/customers`, icon: Users },
    { label: tNav('reports'), href: `/${locale}/reports`, icon: BarChart3 },
    { label: tNav('settings'), href: `/${locale}/settings`, icon: Settings },
  ];

  return (
    <nav className={`mobile-bottom-nav-only ${styles.bottomNav}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
          >
            {isActive && <div className={styles.activeIndicator} />}
            <Icon size={20} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

