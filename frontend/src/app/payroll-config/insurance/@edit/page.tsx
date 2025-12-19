'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { insuranceApi } from '@/app/payroll-config/client';
import { InsuranceBracket, UpdateInsuranceDto, ConfigStatus } from '@/types/payroll-config';
import { Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
function EditInsuranceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('edit');
  const [insurance, setInsurance] = useState<InsuranceBracket | null>(null);
  const [formData, setFormData] = useState<UpdateInsuranceDto>({
    name: '',
    minSalary: 0,
    maxSalary: 0,
    employeeRate: 0,
    employerRate: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadInsurance = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await insuranceApi.getById(id);
        setInsurance(data);
        setFormData({
          name: data.name,
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
          employeeRate: data.employeeRate,
          employerRate: data.employerRate,
        });
        if (data.status !== ConfigStatus.DRAFT) {
          alert('Only draft insurance brackets can be edited');
          router.push('/payroll-config/insurance');
        }
      } catch (error) {
        console.error('Error loading insurance:', error);
        alert('Failed to load insurance');
        router.push('/payroll-config/insurance');
      } finally {
        setFetching(false);
      }
    };
    loadInsurance();
  }, [id, router]);

  if (!id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const minSalary = formData.minSalary || insurance?.minSalary || 0;
    const maxSalary = formData.maxSalary || insurance?.maxSalary || 0;

    if (maxSalary <= minSalary) {
      setErrors({ maxSalary: 'Max Salary must be greater than Min Salary' });
      return;
    }

    setLoading(true);
    try {
      await insuranceApi.update(id, formData);
      router.push('/payroll-config/insurance');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating insurance:', error);
      alert(error.message || 'Failed to update insurance');
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
            <h2 className="text-xl font-semibold text-gray-900">Edit Insurance Bracket</h2>
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
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Min Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={String(formData.minSalary || 0)}
                  onChange={(e) => setFormData({ ...formData, minSalary: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>Max Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={String(formData.maxSalary || 0)}
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
                  step={0.01}
                  value={String(formData.employeeRate || 0)}
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
                  step={0.01}
                  value={String(formData.employerRate || 0)}
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
                Update
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditInsurancePage() {
  return (
    <Suspense fallback={null}>
      <EditInsuranceForm />
    </Suspense>
  );
}

