'use client';

import React from 'react';
import { YearEndResult } from '../../types/leaves';

interface YearEndSummaryProps {
  result: YearEndResult;
  showActionButton?: boolean;
  onRunYearEnd?: () => void;
}

export default function YearEndSummary({
  result,
  showActionButton = false,
  onRunYearEnd,
}: YearEndSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Main Summary Card */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Fiscal Year {result.fiscalYear} Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">Carried Forward</p>
            <p className="text-2xl font-bold text-blue-900">{result.carriedForward} days</p>
            <p className="text-xs text-blue-600 mt-1">According to policy limits</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-900">{result.expired} days</p>
            <p className="text-xs text-red-600 mt-1">Days that could not be carried forward</p>
          </div>
        </div>

        {/* Encashment Section */}
        {result.encashmentAmount !== undefined && result.encashmentDays !== undefined && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Encashment Preview</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-green-700">Eligible Days:</span>
                <span className="text-sm font-medium text-green-900">
                  {result.encashmentDays} days (capped at 30 days)
                </span>
              </div>
              {result.dailySalaryRate && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-green-700">Daily Salary Rate:</span>
                  <span className="text-sm font-medium text-green-900">
                    ${result.dailySalaryRate.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="text-sm font-semibold text-green-900">Encashment Amount:</span>
                <span className="text-lg font-bold text-green-900">
                  ${result.encashmentAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Encashment Formula */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
              <p className="font-medium mb-1">Encashment Formula:</p>
              <p className="font-mono">
                EncashmentAmount = DailySalaryRate × UnusedLeaveDays (capped at 30)
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {result.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes:</span> {result.notes}
            </p>
          </div>
        )}
      </div>

      {/* HR Action Button */}
      {showActionButton && (
        <div className="border border-gray-200 rounded-lg p-4 bg-amber-50">
          <p className="text-sm text-gray-700 mb-3">
            <strong>HR Only:</strong> Run year-end processing to finalize leave balances and apply carry-forward rules.
          </p>
          <button
            onClick={onRunYearEnd}
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-60 text-sm font-medium"
            title="This action is disabled in demo mode"
          >
            Run Year-End Processing
          </button>
        </div>
      )}
    </div>
  );
}
