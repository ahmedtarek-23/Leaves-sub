'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getLeaveHistory } from '../../../services/leaves.service';
import { LeaveRequest, LeaveStatus, LeaveHistoryFilters } from '../../../types/leaves';
import LeaveRequestTable from '../../../components/leaves/LeaveRequestTable';
import StatusBadge from '../../../components/leaves/StatusBadge';

export default function LeaveHistoryPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeaveHistoryFilters>({});

  useEffect(() => {
    loadHistory();
  }, [user, filters]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const employeeId = user?.employeeId || user?.userId;
      const data = await getLeaveHistory({
        ...filters,
        employeeId,
      });
      setRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
          <p className="mt-2 text-sm text-gray-600">
            View your complete leave request history with filters and audit trail.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value ? (e.target.value as LeaveStatus) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value={LeaveStatus.PENDING}>Pending</option>
                <option value={LeaveStatus.APPROVED}>Approved</option>
                <option value={LeaveStatus.REJECTED}>Rejected</option>
                <option value={LeaveStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
            <p className="text-gray-500 text-sm">Loading history...</p>
          </div>
        ) : (
          <LeaveRequestTable requests={requests} showEmployee={false} showActions={false} />
        )}
      </div>
    </div>
  );
}

