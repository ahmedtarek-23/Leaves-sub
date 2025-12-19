import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Payroll Configuration',
  description: 'Manage payroll configurations, policies, and settings',
};

export default function PayrollConfigLayout({
  children,
}: {
  children: ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <AppShell
      title="Payroll configuration"
      subtitle="Manage payroll policies, pay grades, allowances, tax rules, and related settings"
      allowedRoles={['Payroll Manager', 'Payroll Specialist', 'HR Admin', 'HR Manager', 'System Admin']}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </AppShell>
  );
}

