'use client';

import React, { useState, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { allowancesApi } from '@/app/payroll-config/client';
import { CreateAllowanceDto } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function CreateAllowanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const show = searchParams.get('create') === 'true';
  const [formData, setFormData] = useState<CreateAllowanceDto>({
    name: '',
    amount: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CreateAllowanceDto) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await allowancesApi.create(formData);
      setSuccess(true);
      router.push('/payroll-config/allowances');
      router.refresh();
    } catch (err) {
      console.error('Error creating allowance:', err);
      const message = err instanceof Error ? err.message : 'Failed to create allowance';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) router.push('/payroll-config/allowances');
  };

  if (!show) return null;

  return (
    <Dialog open={show} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new allowance</DialogTitle>
          <DialogDescription>Define the allowance details and amount.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                name="frequency"
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                defaultValue="monthly"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                defaultValue="DRAFT"
              >
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {success && (
            <p className="text-sm font-medium text-green-600">
              Allowance created successfully.
            </p>
          )}
          <DialogFooter className="justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/payroll-config/allowances')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CreateAllowancePage() {
  return (
    <Suspense fallback={null}>
      <CreateAllowanceForm />
    </Suspense>
  );
}

