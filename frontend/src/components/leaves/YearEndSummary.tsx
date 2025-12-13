import React from 'react';
import { YearEndSummary as YearEndSummaryType } from '../../types/leave';

export default function YearEndSummary({ summary }: { summary: YearEndSummaryType }) {
  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 6, maxWidth: 800 }}>
      <p><strong>Fiscal Year:</strong> {summary.fiscalYear}</p>
      <p><strong>Total Carried Forward:</strong> {summary.carriedForward}</p>
      <p><strong>Total Expired:</strong> {summary.expired}</p>
      <p><strong>Notes:</strong> {summary.notes || '-'}</p>
    </div>
  );
}
