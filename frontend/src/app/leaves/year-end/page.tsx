import React from 'react';
import YearEndSummary from '../../../components/leaves/YearEndSummary';
import mockData from '../../../data/mockLeaves';

export default function Page() {
  const { yearEnd } = mockData;

  return (
    <div style={{ padding: 24 }}>
      <h1>Year-End Leave Summary</h1>
      <YearEndSummary summary={yearEnd} />
    </div>
  );
}
