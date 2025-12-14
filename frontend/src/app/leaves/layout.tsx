'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { SystemRole } from '../../types/leaves';

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hasRole, isManager, isHR, isAdmin } = useAuth();

  const navItems = [
    { href: '/leaves/dashboard', label: 'Dashboard', show: true },
    { href: '/leaves/requests/new', label: 'New Request', show: true },
    { href: '/leaves/history', label: 'History', show: true },
    {
      href: '/leaves/approvals',
      label: 'Approvals',
      show: isManager(),
    },
    {
      href: '/leaves/review',
      label: 'HR Review',
      show: isHR(),
    },
    {
      href: '/leaves/policies',
      label: 'Policies',
      show: isAdmin(),
    },
    {
      href: '/leaves/adjustments',
      label: 'Adjustments',
      show: isHR(),
    },
    {
      href: '/leaves/year-end',
      label: 'Year-End',
      show: isAdmin(),
    },
    {
      href: '/leaves/offboarding',
      label: 'Offboarding',
      show: isHR(),
    },
  ].filter((item) => item.show);

  return (
    <div>
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
