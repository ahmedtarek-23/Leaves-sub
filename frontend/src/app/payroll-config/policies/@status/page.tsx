'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { payrollPoliciesApi } from '@/app/payroll-config/client';
import { PayrollPolicy, ConfigStatus } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function ChangeStatusForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('status');
  const [policy, setPolicy] = useState<PayrollPolicy | null>(null);
  const [statusData, setStatusData] = useState<{ status: ConfigStatus; rejectionReason?: string }>({
    status: ConfigStatus.APPROVED,
    rejectionReason: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadPolicy = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await payrollPoliciesApi.getById(id);
        setPolicy(data);
        setStatusData({
          status: ConfigStatus.APPROVED,
          rejectionReason: '',
        });
      } catch (error) {
        console.error('Error loading policy:', error);
        alert('Failed to load policy');
        router.push('/payroll-config/policies');
      } finally {
        setFetching(false);
      }
    };
    loadPolicy();
  }, [id, router]);

  if (!id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await payrollPoliciesApi.changeStatus(id, statusData);
      router.push('/payroll-config/policies');
      router.refresh();
    } catch (error: any) {
      console.error('Error changing status:', error);
      alert(error.message || 'Failed to change status');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[100]">
        <div className="bg-white rounded-lg p-6 relative z-[101]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[101]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Change Status: {policy?.policyName}
            </h2>
            <button
              onClick={() => router.push('/payroll-config/policies')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Current Status: <span className="font-semibold">{policy?.status}</span>
              </p>
            </div>
            <div>
              <Label className="mb-1">New Status</Label>
              <select
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusData.status as any}
                onChange={(e) => setStatusData({ ...statusData, status: e.target.value as ConfigStatus })}
                required
              >
                <option value={ConfigStatus.APPROVED}>Approve</option>
                <option value={ConfigStatus.REJECTED}>Reject</option>
              </select>
            </div>
            {statusData.status === ConfigStatus.REJECTED && (
              <div>
                <Label className="mb-1">Rejection Reason</Label>
                <textarea
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={statusData.rejectionReason || ''}
                  onChange={(e) => setStatusData({ ...statusData, rejectionReason: e.target.value })}
                  rows={3}
                  required
                />
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/policies')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={loading}>
                Confirm
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChangeStatusPage() {
  return (
    <Suspense fallback={null}>
      <ChangeStatusForm />
    </Suspense>
  );
}

