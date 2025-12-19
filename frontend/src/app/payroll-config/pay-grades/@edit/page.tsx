'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { payGradesApi } from '@/app/payroll-config/client';
import { PayGrade, UpdatePayGradeDto, ConfigStatus } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function EditPayGradeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('edit');
  const [payGrade, setPayGrade] = useState<PayGrade | null>(null);
  const [formData, setFormData] = useState<UpdatePayGradeDto>({
    grade: '',
    baseSalary: 0,
    grossSalary: 0,
    departmentId: '',
    positionId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadPayGrade = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await payGradesApi.getById(id);
        setPayGrade(data);
        setFormData({
          grade: data.grade,
          baseSalary: data.baseSalary,
          grossSalary: data.grossSalary,
          departmentId: data.departmentId || '',
          positionId: data.positionId || '',
        });
        if (data.status !== ConfigStatus.DRAFT) {
          alert('Only draft pay grades can be edited');
          router.push('/payroll-config/pay-grades');
        }
      } catch (error) {
        console.error('Error loading pay grade:', error);
        alert('Failed to load pay grade');
        router.push('/payroll-config/pay-grades');
      } finally {
        setFetching(false);
      }
    };
    loadPayGrade();
  }, [id, router]);

  if (!id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (formData.grossSalary && formData.baseSalary && formData.grossSalary < formData.baseSalary) {
      setErrors({ grossSalary: 'Gross Salary cannot be less than Base Salary' });
      return;
    }

    setLoading(true);
    try {
      await payGradesApi.update(id, formData);
      router.push('/payroll-config/pay-grades');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating pay grade:', error);
      alert(error.message || 'Failed to update pay grade');
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
            <h2 className="text-xl font-semibold text-gray-900">Edit Pay Grade</h2>
            <button
              onClick={() => router.push('/payroll-config/pay-grades')}
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
                <Label>Grade</Label>
                <Input
                  value={formData.grade || ''}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Base Salary</Label>
                <Input
                  type="number"
                  min={6000}
                  value={String(formData.baseSalary || 0)}
                  onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>Gross Salary</Label>
                <Input
                  type="number"
                  min={6000}
                  value={String(formData.grossSalary || 0)}
                  onChange={(e) => setFormData({ ...formData, grossSalary: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/pay-grades')}
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

export default function EditPayGradePage() {
  return (
    <Suspense fallback={null}>
      <EditPayGradeForm />
    </Suspense>
  );
}

