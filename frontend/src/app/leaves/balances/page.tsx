import React from 'react';
import LeaveBalanceTable from '../../../components/leaves/LeaveBalanceTable';
import mockData from '../../../data/mockLeaves';

export default function Page() {
  const { balances } = mockData;

  return (
    <div style={{ padding: 24 }}>
      <h1>My Leave Balances</h1>
      <LeaveBalanceTable balances={balances} />
    </div>
  );
}
