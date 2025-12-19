'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { payTypesApi } from '@/app/payroll-config/client';
import { CreatePayTypeDto } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CreatePayTypeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const show = searchParams.get('create') === 'true';
  const [formData, setFormData] = useState<CreatePayTypeDto>({
    type: '',
    amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await payTypesApi.create(formData);
      router.push('/payroll-config/pay-types');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating pay type:', error);
      alert(error.message || 'Failed to create pay type');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[101]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Pay Type</h2>
            <button
              onClick={() => router.push('/payroll-config/pay-types')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  placeholder="e.g., hourly, daily, weekly, monthly, contract-based"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min={6000}
                  value={String(formData.amount)}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/pay-types')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={loading}>
                Create
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreatePayTypePage() {
  return (
    <Suspense fallback={null}>
      <CreatePayTypeForm />
    </Suspense>
  );
}

