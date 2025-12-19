import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Settings | Payroll Configuration',
  description: 'Set company-wide settings like pay dates, time zone, and currency',
};

export default function CompanySettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

