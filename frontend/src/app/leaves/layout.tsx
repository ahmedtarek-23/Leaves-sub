"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/leaves/balances', label: 'Balances' },
    { href: '/leaves/accrual', label: 'Accrual' },
    { href: '/leaves/year-end', label: 'Year-End' },
  ];

  return (
    <div>
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
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
