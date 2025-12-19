'use client';

import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default function PayrollConfigDashboard() {
  const user = getCurrentUser();
  const userRole = user?.role || '';

  // Define which sections each role can access based on requirements
  const allConfigSections = [
    { 
      href: '/payroll-config/policies', 
      label: 'Payroll Policies', 
      description: 'Configure company-level payroll policies',
      allowedRoles: ['Payroll Specialist', 'Payroll Manager', 'HR Admin', 'HR Manager', 'System Admin']
    },
    { 
      href: '/payroll-config/pay-grades', 
      label: 'Pay Grades', 
      description: 'Define pay grades, salary, and compensation limits',
      allowedRoles: ['Payroll Specialist', 'Payroll Manager', 'HR Admin', 'HR Manager', 'System Admin']
    },
    { 
      href: '/payroll-config/pay-types', 
      label: 'Pay Types', 
      description: 'Define employee pay types (hourly, daily, weekly, monthly)',
      allowedRoles: ['Payroll Specialist', 'Payroll Manager', 'HR Admin', 'HR Manager', 'System Admin']
    },
    { 
      href: '/payroll-config/allowances', 
      label: 'Allowances', 
      description: 'Set allowances (transportation, housing, etc)',
      allowedRoles: ['Payroll Specialist', 'Payroll Manager', 'HR Admin', 'HR Manager', 'System Admin']
    },
    { 
      href: '/payroll-config/tax-rules', 
      label: 'Tax Rules', 
      description: 'Define tax rules and laws',
      allowedRoles: ['Payroll Specialist', 'Payroll Manager', 'HR Admin', 'HR Manager', 'System Admin']
    },
    { 
      href: '/payroll-config/signing-bonuses', 
      label: 'Signing Bonuses', 
      description: 'Configure policies for signing bonuses',
      allowedRoles: ['Payroll Specialist', 'Payroll Manager', 'HR Admin', 'HR Manager', 'System Admin']
    },
    { 
      href: '/payroll-config/termination-benefits', 
      label: 'Termination Benefits', 
      description: 'Configure resignation and termination benefits',
      allowedRoles: ['Payroll Specialist', 'Payroll Manager', 'HR Admin', 'HR Manager', 'System Admin']
    },
    { 
      href: '/payroll-config/insurance', 
      label: 'Insurance Brackets', 
      description: 'Configure insurance brackets with salary ranges',
      allowedRoles: ['HR Manager', 'System Admin', 'Payroll Manager', 'Payroll Specialist'] // All can view, but only HR Manager and System Admin can edit
    },
    { 
      href: '/payroll-config/company-settings', 
      label: 'Company Settings', 
      description: 'Configure company-wide payroll settings',
      allowedRoles: ['System Admin'] // REQ-PY-15: Only System Admin
    },
  ];

  // Filter sections based on user role
  const configSections = allConfigSections.filter(section => 
    section.allowedRoles.includes(userRole)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Payroll Configuration Dashboard</h1>
        <p className="text-muted-foreground">Manage and configure all payroll settings and policies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="block p-6 bg-card rounded-lg shadow hover:shadow-md transition-shadow border border-border"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">{section.label}</h2>
            <p className="text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
