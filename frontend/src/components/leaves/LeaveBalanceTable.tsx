"use client";

import React from 'react';
import { LeaveBalance } from '../../types/leaves';

interface LeaveBalanceTableProps {
  balances: LeaveBalance[];
}

export default function LeaveBalanceTable({ balances }: LeaveBalanceTableProps) {
  if (balances.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
        <p className="text-gray-500 text-sm">No leave balances found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Leave Type
            </th>
            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Accrued
            </th>
            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Used
            </th>
            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Remaining
            </th>
            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Pending
            </th>
            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Carry-Over
            </th>
          </tr>
        </thead>
        <tbody>
          {balances.map((balance) => (
            <tr key={balance.leaveTypeCode} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                {balance.leaveTypeName}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right border-b border-gray-100">
                {balance.accrued.toFixed(1)} days
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-100">
                {balance.used.toFixed(1)} days
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right border-b border-gray-100">
                {balance.remaining.toFixed(1)} days
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-100">
                {balance.pending > 0 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {balance.pending.toFixed(1)} days
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-100">
                {balance.carryOver && balance.carryOver > 0 ? (
                  <span className="text-blue-600 font-medium">
                    {balance.carryOver.toFixed(1)} days
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
