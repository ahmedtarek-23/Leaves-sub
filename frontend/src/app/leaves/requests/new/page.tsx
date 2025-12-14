'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { createLeaveRequest, CreateLeaveRequestDto } from '../../../../services/leaves.service';
import LeaveRequestForm from '../../../../components/leaves/LeaveRequestForm';

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateLeaveRequestDto) => {
    try {
      setIsLoading(true);
      setError(null);
      await createLeaveRequest(data);
      router.push('/leaves/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
      throw err; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!user?.employeeId && !user?.userId) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Employee ID not found. Please contact HR.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Leave Request</h1>
          <p className="mt-2 text-sm text-gray-600">
            Submit a new leave request. All fields marked with * are required.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <LeaveRequestForm
            employeeId={user.employeeId || user.userId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

