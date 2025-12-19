'use client';

import React, { useState, useEffect, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { allowancesApi } from '@/app/payroll-config/client';
import { UpdateAllowanceDto, ConfigStatus } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function EditAllowanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('edit');
  const [formData, setFormData] = useState<UpdateAllowanceDto>({
    name: '',
    amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllowance = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await allowancesApi.getById(id);
        setFormData({
          name: data.name,
          amount: data.amount,
        });
        if (data.status !== ConfigStatus.DRAFT) {
          alert('Only draft allowances can be edited');
          router.push('/payroll-config/allowances');
        }
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

  const handleChange = (field: keyof UpdateAllowanceDto) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await allowancesApi.update(id, formData);
      router.push('/payroll-config/allowances');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error updating allowance:', error);
      const message = error instanceof Error ? error.message : 'Failed to update allowance';
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

  const show = Boolean(id);
  return (
  <Dialog open={show} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit allowance</DialogTitle>
          <DialogDescription>Update the name or amount for this allowance.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange('name')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={String(formData.amount)}
              onChange={handleChange('amount')}
              required
            />
          </div>
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
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function EditAllowancePage() {
  return (
    <Suspense fallback={null}>
      <EditAllowanceForm />
    </Suspense>
  );
}

