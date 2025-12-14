"use client";

import React, { useEffect, useState } from 'react';
import LeaveBalanceTable from '../../../components/leaves/LeaveBalanceTable';
import { getLeaveBalances } from '../../../services/leave.service';
import { LeaveBalance } from '../../../types/leave';

export default function Page() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      try {
        setLoading(true);
        const data = await getLeaveBalances();
        setBalances(data);
        setError(null);
      } catch (err) {
        setError('Failed to load leave balances. Please try again later.');
        console.error('Error fetching leave balances:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, []);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Leave Balances</h1>
          <p className="mt-2 text-sm text-gray-600">
            View your current leave balances including accrued, used, remaining, pending, and carry-over days.
          </p>
        </div>

        {loading && (
          <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
            <p className="text-gray-500 text-sm">Loading leave balances...</p>
          </div>
        )}

        {error && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && <LeaveBalanceTable balances={balances} />}
      </div>
    </div>
  );
}
