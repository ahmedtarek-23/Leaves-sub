import React from 'react';
import { LeaveBalance } from '../../types/leave';

export default function LeaveBalanceTable({ balances }: { balances: LeaveBalance[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>Leave Type</th>
          <th style={{ textAlign: 'right', padding: 8 }}>Accrued</th>
          <th style={{ textAlign: 'right', padding: 8 }}>Taken</th>
          <th style={{ textAlign: 'right', padding: 8 }}>Remaining</th>
        </tr>
      </thead>
      <tbody>
        {balances.map((b) => (
          <tr key={b.leaveTypeCode}>
            <td style={{ padding: 8, borderTop: '1px solid #eee' }}>{b.leaveTypeName}</td>
            <td style={{ padding: 8, borderTop: '1px solid #eee', textAlign: 'right' }}>{b.accrued}</td>
            <td style={{ padding: 8, borderTop: '1px solid #eee', textAlign: 'right' }}>{b.taken}</td>
            <td style={{ padding: 8, borderTop: '1px solid #eee', textAlign: 'right' }}>{b.remaining}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
