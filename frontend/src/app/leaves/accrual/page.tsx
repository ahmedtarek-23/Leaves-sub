"use client";

import React, { useEffect, useState } from 'react';
import AccrualHistoryTable from '../../../components/leaves/AccrualHistoryTable';
import { getAccrualHistory } from '../../../services/leave.service';
import { AccrualRecord } from '../../../types/leave';

export default function Page() {
  const [accruals, setAccruals] = useState<AccrualRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccruals() {
      try {
        setLoading(true);
        const data = await getAccrualHistory();
        setAccruals(data);
        setError(null);
      } catch (err) {
        setError('Failed to load accrual history. Please try again later.');
        console.error('Error fetching accrual history:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccruals();
  }, []);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Accrual History</h1>
          <p className="mt-2 text-sm text-gray-600">
            View the complete history of leave accruals, including automatic system-generated accruals and manual adjustments.
          </p>
        </div>

        {/* REQ-040: Informational message about continuous leave accrual */}
        <div className="mb-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Continuous Leave Accrual (REQ-040)
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Leave balances are automatically accrued on a continuous basis according to your employment terms and policies. 
                  This table shows all accrual transactions, including both automatic system-generated accruals and any manual adjustments made by HR.
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
            <p className="text-gray-500 text-sm">Loading accrual history...</p>
          </div>
        )}

        {error && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && <AccrualHistoryTable accruals={accruals} />}
      </div>
    </div>
  );
}
