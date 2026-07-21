'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ArrowDownLeft
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tNav = useTranslations('nav');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const isCollapsed = localStorage.getItem('khataflow_sidebar_collapsed') === 'true';
    setCollapsed(isCollapsed);
  }, []);

  const toggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem('khataflow_sidebar_collapsed', String(nextState));
  };

  const mainNav = [
    { label: tNav('dashboard'), href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { label: tNav('customers'), href: `/${locale}/customers`, icon: Users },
  ];

  const toolsNav = [
    { label: tNav('reports'), href: `/${locale}/reports`, icon: BarChart3 },
  ];

  const settingsNav = [
    { label: tNav('settings'), href: `/${locale}/settings`, icon: Settings },
  ];

  return (
    <aside
      className={`desktop-sidebar-only ${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
    >
      {/* Logo Section */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          <BookOpen size={22} />
        </div>
        {!collapsed && (
          <div className={styles.brandTitle}>
            <h1 className={styles.brandName}>KhataMate</h1>
            <span className={styles.brandSub}>Digital Ledger</span>
          </div>

        )}
      </div>

      {/* Navigation Groups */}
      <nav className={styles.navSection}>
        {/* Main Group */}
        <div className={styles.sectionGroup}>
          {!collapsed && <span className={styles.sectionLabel}>Main Menu</span>}
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>


        {/* Tools Group */}
        <div className={styles.sectionGroup}>
          {!collapsed && <span className={styles.sectionLabel}>Analytics</span>}
          {toolsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== `/${locale}` && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Settings Group */}
        <div className={styles.sectionGroup}>
          {!collapsed && <span className={styles.sectionLabel}>System</span>}
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== `/${locale}` && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <button className={styles.collapseToggle} onClick={toggleCollapse} title="Toggle Sidebar">
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
}
