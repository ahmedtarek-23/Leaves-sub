'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { insuranceApi } from '@/app/payroll-config/client';
import { CreateInsuranceDto } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CreateInsuranceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const show = searchParams.get('create') === 'true';
  const [formData, setFormData] = useState<CreateInsuranceDto>({
    name: '',
    minSalary: 0,
    maxSalary: 0,
    employeeRate: 0,
    employerRate: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.minSalary >= formData.maxSalary) {
      alert('Max Salary must be greater than Min Salary');
      return;
    }

    if (formData.employeeRate < 0 || formData.employeeRate > 100) {
      alert('Employee Rate must be between 0 and 100');
      return;
    }

    if (formData.employerRate < 0 || formData.employerRate > 100) {
      alert('Employer Rate must be between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      await insuranceApi.create(formData);
      router.push('/payroll-config/insurance');
      router.refresh();
    } catch (error) {
      console.error('Error creating insurance:', error);
      const message = error instanceof Error ? error.message : 'Failed to create insurance';
      alert(message);
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
            <h2 className="text-xl font-semibold text-gray-900">Create New Insurance Bracket</h2>
            <button
              onClick={() => router.push('/payroll-config/insurance')}
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
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Min Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={String(formData.minSalary)}
                  onChange={(e) => setFormData({ ...formData, minSalary: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>Max Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={String(formData.maxSalary)}
                  onChange={(e) => setFormData({ ...formData, maxSalary: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>Employee Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={String(formData.employeeRate)}
                  onChange={(e) => setFormData({ ...formData, employeeRate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>Employer Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={String(formData.employerRate)}
                  onChange={(e) => setFormData({ ...formData, employerRate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/insurance')}
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

export default function CreateInsurancePage() {
  return (
    <Suspense fallback={null}>
      <CreateInsuranceForm />
    </Suspense>
  );
}

