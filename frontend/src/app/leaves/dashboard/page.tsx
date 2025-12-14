'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getLeaveBalances } from '../../../services/leaves.service';
import { LeaveBalance } from '../../../types/leaves';
import LeaveBalanceTable from '../../../components/leaves/LeaveBalanceTable';
import Link from 'next/link';

export default function LeaveDashboardPage() {
  const { user, isEmployee, isManager, isHR, isLoading: authLoading } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBalances();
    }
  }, [user]);

  const loadBalances = async () => {
    try {
      setLoading(true);
      const employeeId = user?.employeeId || user?.userId;
      const data = await getLeaveBalances(employeeId);
      setBalances(data);
      setError(null);
    } catch (err: any) {
      // Error is already handled in service with fallback, but set error state if needed
      console.warn('Error fetching leave balances:', err);
      // Don't set error state since service will return mock data
    } finally {
      setLoading(false);
    }
  };

  const totalAccrued = balances.reduce((sum, b) => sum + b.accrued, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  const totalRemaining = balances.reduce((sum, b) => sum + b.remaining, 0);
  const totalPending = balances.reduce((sum, b) => sum + b.pending, 0);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leave Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            View your current leave balances and quick actions.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          {isEmployee() && (
            <Link
              href="/leaves/requests/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Request Leave
            </Link>
          )}
          <Link
            href="/leaves/history"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            View History
          </Link>
          {isManager() && (
            <Link
              href="/leaves/approvals"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Pending Approvals
            </Link>
          )}
          {isHR() && (
            <>
              <Link
                href="/leaves/review"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                HR Review
              </Link>
              <Link
                href="/leaves/policies"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Policy Configuration
              </Link>
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Accrued</div>
            <div className="text-2xl font-bold text-gray-900">{totalAccrued.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">days</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Used</div>
            <div className="text-2xl font-bold text-gray-900">{totalUsed.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">days</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Remaining</div>
            <div className="text-2xl font-bold text-green-600">{totalRemaining.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">days</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{totalPending.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">days</div>
          </div>
        </div>

        {/* Loading State */}
        {(loading || authLoading) && (
          <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
            <p className="text-gray-500 text-sm">Loading leave balances...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 mb-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadBalances}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Balance Table */}
        {!loading && !authLoading && !error && <LeaveBalanceTable balances={balances} />}
      </div>
    </div>
  );
}

