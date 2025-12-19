'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/payroll-config/policies', label: 'Policies', icon: '📋' },
    { href: '/payroll-config/pay-grades', label: 'Pay Grades', icon: '💰' },
    { href: '/payroll-config/pay-types', label: 'Pay Types', icon: '⏰' },
    { href: '/payroll-config/allowances', label: 'Allowances', icon: '🏠' },
    { href: '/payroll-config/tax-rules', label: 'Tax Rules', icon: '📊' },
    { href: '/payroll-config/insurance', label: 'Insurance', icon: '🛡️' },
    { href: '/payroll-config/signing-bonuses', label: 'Signing Bonuses', icon: '🎁' },
    { href: '/payroll-config/termination-benefits', label: 'Termination Benefits', icon: '👋' },
    { href: '/payroll-config/company-settings', label: 'Company Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-background text-foreground border-r border-border min-h-screen p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Payroll System</h2>
          <p className="text-sm text-muted-foreground">Manage configurations</p>
        </div>
        <button
          onClick={toggleTheme}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border bg-card text-foreground shadow-sm hover:shadow-md"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

