"use client";

import React, { useEffect, useState } from 'react';
import YearEndSummary from '../../../components/leaves/YearEndSummary';
import { getYearEndResult } from '../../../services/leave.service';
import { YearEndResult } from '../../../types/leave';

export default function Page() {
  const [yearEndResult, setYearEndResult] = useState<YearEndResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchYearEndResult() {
      try {
        setLoading(true);
        const data = await getYearEndResult();
        setYearEndResult(data);
        setError(null);
      } catch (err) {
        setError('Failed to load year-end summary. Please try again later.');
        console.error('Error fetching year-end result:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchYearEndResult();
  }, []);

  const handleRunYearEnd = async () => {
    // This would trigger the year-end processing in production
    // For now, it's disabled as per requirements
    console.log('Year-end processing would be triggered here');
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Year-End Leave Summary</h1>
          <p className="mt-2 text-sm text-gray-600">
            View year-end processing results including carry-forward balances, expired days, and encashment calculations (REQ-041).
          </p>
        </div>

        {loading && (
          <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
            <p className="text-gray-500 text-sm">Loading year-end summary...</p>
          </div>
        )}

        {error && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && yearEndResult && (
          <YearEndSummary 
            summary={yearEndResult} 
            showActionButton={true}
            onRunYearEnd={handleRunYearEnd}
          />
        )}
      </div>
    </div>
  );
}
