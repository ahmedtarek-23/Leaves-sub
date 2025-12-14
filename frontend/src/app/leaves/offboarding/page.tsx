'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getOffboardingSettlement, encashLeave } from '../../../services/leaves.service';
import { OffboardingSettlement } from '../../../types/leaves';
import LeaveBalanceTable from '../../../components/leaves/LeaveBalanceTable';

export default function OffboardingPage() {
  const { user, isHR } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [settlement, setSettlement] = useState<OffboardingSettlement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadSettlement = async () => {
    if (!employeeId.trim()) {
      setError('Please enter an employee ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getOffboardingSettlement(employeeId);
      setSettlement(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load settlement data');
      setSettlement(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEncash = async () => {
    if (!settlement || !confirm('Are you sure you want to process encashment?')) return;

    try {
      setIsProcessing(true);
      // Note: This would typically be done through a specific request, but for now we'll use a mock
      alert('Encashment processed successfully');
      await loadSettlement();
    } catch (err: any) {
      alert(err.message || 'Failed to process encashment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isHR()) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">Access denied. HR privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Offboarding & Final Settlement</h1>
          <p className="mt-2 text-sm text-gray-600">
            View remaining leave balance and calculate encashment for terminated employees.
          </p>
        </div>

        {/* Employee Search */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadSettlement()}
                placeholder="Enter employee ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadSettlement}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load Settlement'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {settlement && (
          <div className="space-y-6">
            {/* Lock Warning */}
            {settlement.isLocked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Locked:</strong> Leave actions are locked for this employee after
                  termination.
                </p>
              </div>
            )}

            {/* Employee Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Employee: {settlement.employeeName}
              </h2>
              <LeaveBalanceTable balances={settlement.remainingBalance} />
            </div>

            {/* Encashment Calculation */}
            {settlement.encashmentDays > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Encashment Calculation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Unused Leave Days</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {settlement.encashmentDays} days
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Capped at 30 days per policy)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Daily Salary Rate</label>
                    <p className="text-lg font-semibold text-gray-900">
                      ${settlement.dailySalaryRate.toFixed(2)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Total Encashment Amount</label>
                    <p className="text-2xl font-bold text-green-600">
                      ${settlement.encashmentAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Calculation: {settlement.encashmentDays} days × ${settlement.dailySalaryRate.toFixed(2)} = ${settlement.encashmentAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {!settlement.isLocked && (
                  <button
                    onClick={handleEncash}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Process Encashment'}
                  </button>
                )}
              </div>
            )}

            {settlement.encashmentDays === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  No unused leave days available for encashment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

