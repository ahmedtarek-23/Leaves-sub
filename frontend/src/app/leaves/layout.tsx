import React from 'react';

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
        <a href="/leaves/balances" style={{ marginRight: 12 }}>Balances</a>
        <a href="/leaves/accrual" style={{ marginRight: 12 }}>Accrual</a>
        <a href="/leaves/year-end">Year-end</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
