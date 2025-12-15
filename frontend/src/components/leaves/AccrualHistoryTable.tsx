"use client";

import React from 'react';
import { AccrualRecord } from '../../types/leave';

interface AccrualHistoryTableProps {
  accruals: AccrualRecord[];
}

export default function AccrualHistoryTable({ accruals }: AccrualHistoryTableProps) {
  if (accruals.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
        <p className="text-gray-500 text-sm">No accrual records found.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Date
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Leave Type
            </th>
            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Amount
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Type
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Reason
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Adjusted By
            </th>
          </tr>
        </thead>
        <tbody>
          {accruals.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                {formatDate(record.date)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                {record.leaveTypeName}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right border-b border-gray-100">
                {record.amount > 0 ? (
                  <span className="text-green-600">+{record.amount.toFixed(1)} days</span>
                ) : (
                  <span className="text-red-600">{record.amount.toFixed(1)} days</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm border-b border-gray-100">
                {record.adjustmentType === 'manual' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Manual
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Automatic
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                {record.reason || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                {record.adjustedBy || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
