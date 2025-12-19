'use client';

import React, { useState, useEffect, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { allowancesApi } from '@/app/payroll-config/client';
import { Allowance, ConfigStatus } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function ChangeStatusForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('status');
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [statusData, setStatusData] = useState<{ status: ConfigStatus; rejectionReason?: string }>({
    status: ConfigStatus.APPROVED,
    rejectionReason: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const show = Boolean(id);

  useEffect(() => {
    const loadAllowance = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await allowancesApi.getById(id);
        setAllowance(data);
        setStatusData({
          status: ConfigStatus.APPROVED,
          rejectionReason: '',
        });
      } catch (error) {
        console.error('Error loading allowance:', error);
        const message = error instanceof Error ? error.message : 'Failed to load allowance';
        alert(message);
        router.push('/payroll-config/allowances');
      } finally {
        setFetching(false);
      }
    };
    loadAllowance();
  }, [id, router]);

  if (!id) return null;

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'status' ? (value as ConfigStatus) : value;
    setStatusData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await allowancesApi.changeStatus(id, statusData);
      router.push('/payroll-config/allowances');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error changing status:', error);
      const message = error instanceof Error ? error.message : 'Failed to change status';
      setError(message);
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

  const handleOpenChange = (open: boolean) => {
    if (!open) router.push('/payroll-config/allowances');
  };

  return (
    <Dialog open={show} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change status</DialogTitle>
          <DialogDescription>Update the approval state for this allowance.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current status: <span className="font-semibold text-foreground">{allowance?.status}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="status">New status</Label>
            <select
              id="status"
              name="status"
              value={statusData.status}
              onChange={handleStatusChange}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
              required
            >
              <option value={ConfigStatus.APPROVED}>Approve</option>
              <option value={ConfigStatus.REJECTED}>Reject</option>
            </select>
          </div>
          {statusData.status === ConfigStatus.REJECTED && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection reason</Label>
              <Textarea
                id="rejectionReason"
                name="rejectionReason"
                value={statusData.rejectionReason || ''}
                onChange={handleStatusChange}
                required
              />
            </div>
          )}
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <DialogFooter className="justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/payroll-config/allowances')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ChangeStatusPage() {
  return (
    <Suspense fallback={null}>
      <ChangeStatusForm />
    </Suspense>
  );
}

