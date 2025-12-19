'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signingBonusesApi } from '@/app/payroll-config/client';
import { SigningBonus, ConfigStatus } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function ChangeStatusForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('status');
  const [bonus, setBonus] = useState<SigningBonus | null>(null);
  const [statusData, setStatusData] = useState<{ status: ConfigStatus; rejectionReason?: string }>({
    status: ConfigStatus.APPROVED,
    rejectionReason: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadBonus = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await signingBonusesApi.getById(id);
        setBonus(data);
        setStatusData({
          status: ConfigStatus.APPROVED,
          rejectionReason: '',
        });
      } catch (error) {
        console.error('Error loading signing bonus:', error);
        alert('Failed to load signing bonus');
        router.push('/payroll-config/signing-bonuses');
      } finally {
        setFetching(false);
      }
    };
    loadBonus();
  }, [id, router]);

  if (!id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signingBonusesApi.changeStatus(id, statusData);
      router.push('/payroll-config/signing-bonuses');
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
              Change Status: {bonus?.positionName}
            </h2>
            <button
              onClick={() => router.push('/payroll-config/signing-bonuses')}
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
                Current Status: <span className="font-semibold">{bonus?.status}</span>
              </p>
            </div>
            <div className="mb-4">
              <Label>New Status</Label>
              <select
                value={statusData.status}
                onChange={(e) => setStatusData({ ...statusData, status: e.target.value as ConfigStatus })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                required
              >
                <option value={ConfigStatus.APPROVED}>Approve</option>
                <option value={ConfigStatus.REJECTED}>Reject</option>
              </select>
            </div>
            {statusData.status === ConfigStatus.REJECTED && (
              <div className="mb-4">
                <Label>Rejection Reason</Label>
                <textarea
                  value={statusData.rejectionReason || ''}
                  onChange={(e) => setStatusData({ ...statusData, rejectionReason: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/signing-bonuses')}
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

