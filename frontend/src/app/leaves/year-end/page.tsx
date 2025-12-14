'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import YearEndSummary from  '../../../components/leaves/YearEndSummary';;
import { getYearEndResult, runYearEndProcessing } from '../../../services/leaves.service';
import { YearEndResult } from '../../../types/leaves';

export default function YearEndProcessingPage() {
  const { user, isAdmin } = useAuth();
  const [yearEndResult, setYearEndResult] = useState<YearEndResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear() - 1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAdmin()) return;
    loadYearEndResult();
  }, [fiscalYear, user]);

  async function loadYearEndResult() {
    try {
      setLoading(true);
      const result = await getYearEndResult(fiscalYear);
      setYearEndResult(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load year-end results. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function handleProcessYearEnd() {
    if (!confirm('Are you sure you want to process year-end? This action cannot be undone.')) {
      return;
    }

    try {
      setIsProcessing(true);
      const result = await runYearEndProcessing(fiscalYear);
      setYearEndResult(result);
      alert('Year-end processing completed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to process year-end. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isAdmin()) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">Access denied. Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Year-End Processing</h1>
          <p className="mt-2 text-sm text-gray-600">
            Preview and process year-end carry-forward, expiry, and encashment calculations.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Year</label>
          <input
            type="number"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading && (
          <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
            <p className="text-gray-500 text-sm">Loading year-end results...</p>
          </div>
        )}

        {error && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && yearEndResult && (
          <>
            <YearEndSummary result={yearEndResult} />
            <div className="mt-6">
              <button
                onClick={handleProcessYearEnd}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Process Year-End'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
