import React from 'react';
import AccrualHistoryTable from '../../../components/leaves/AccrualHistoryTable';
import mockData from '../../../data/mockLeaves';

export default function Page() {
  const { accruals } = mockData;

  return (
    <div style={{ padding: 24 }}>
      <h1>Accrual History</h1>
      <AccrualHistoryTable accruals={accruals} />
    </div>
  );
}
