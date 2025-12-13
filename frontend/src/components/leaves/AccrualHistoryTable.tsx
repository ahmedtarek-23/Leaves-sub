import React from 'react';
import { AccrualRecord } from '../../types/leave';

export default function AccrualHistoryTable({ accruals }: { accruals: AccrualRecord[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Leave Type</th>
          <th style={{ textAlign: 'right', padding: 8 }}>Amount</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Reason</th>
        </tr>
      </thead>
      <tbody>
        {accruals.map((a, idx) => (
          <tr key={idx}>
            <td style={{ padding: 8, borderTop: '1px solid #eee' }}>{new Date(a.date).toLocaleDateString()}</td>
            <td style={{ padding: 8, borderTop: '1px solid #eee' }}>{a.leaveTypeName}</td>
            <td style={{ padding: 8, borderTop: '1px solid #eee', textAlign: 'right' }}>{a.amount}</td>
            <td style={{ padding: 8, borderTop: '1px solid #eee' }}>{a.reason || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
