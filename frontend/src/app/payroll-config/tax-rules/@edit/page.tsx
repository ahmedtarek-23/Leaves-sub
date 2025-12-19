'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { taxRulesApi } from '@/app/payroll-config/client';
import { TaxRule, UpdateTaxRuleDto, ConfigStatus } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function EditTaxRuleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('edit');
  const [taxRule, setTaxRule] = useState<TaxRule | null>(null);
  const [formData, setFormData] = useState<UpdateTaxRuleDto>({
    name: '',
    description: '',
    rate: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadTaxRule = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await taxRulesApi.getById(id);
        setTaxRule(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          rate: data.rate,
        });
        if (data.status !== ConfigStatus.DRAFT) {
          alert('Only draft tax rules can be edited');
          router.push('/payroll-config/tax-rules');
        }
      } catch (error) {
        console.error('Error loading tax rule:', error);
        alert('Failed to load tax rule');
        router.push('/payroll-config/tax-rules');
      } finally {
        setFetching(false);
      }
    };
    loadTaxRule();
  }, [id, router]);

  if (!id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await taxRulesApi.update(id, formData);
      router.push('/payroll-config/tax-rules');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating tax rule:', error);
      alert(error.message || 'Failed to update tax rule');
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
            <h2 className="text-xl font-semibold text-gray-900">Edit Tax Rule</h2>
            <button
              onClick={() => router.push('/payroll-config/tax-rules')}
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
                <Label>Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  value={String(formData.rate || 0)}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/tax-rules')}
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

export default function EditTaxRulePage() {
  return (
    <Suspense fallback={null}>
      <EditTaxRuleForm />
    </Suspense>
  );
}

