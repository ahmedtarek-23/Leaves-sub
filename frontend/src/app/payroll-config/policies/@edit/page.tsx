'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { payrollPoliciesApi } from '@/app/payroll-config/client';
import { PayrollPolicy, UpdatePayrollPolicyDto, ConfigStatus, PolicyType, Applicability } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const policyTypeOptions = [
  { value: PolicyType.ALLOWANCE, label: 'Allowance' },
  { value: PolicyType.DEDUCTION, label: 'Deduction' },
  { value: PolicyType.BENEFIT, label: 'Benefit' },
  { value: PolicyType.MISCONDUCT, label: 'Misconduct' },
  { value: PolicyType.LEAVE, label: 'Leave' },
];

const applicabilityOptions = [
  { value: Applicability.AllEmployees, label: 'All Employees' },
  { value: Applicability.FULL_TIME, label: 'Full Time Employees' },
  { value: Applicability.PART_TIME, label: 'Part Time Employees' },
  { value: Applicability.CONTRACTORS, label: 'Contractors' },
];

function EditPolicyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('edit');
  const [policy, setPolicy] = useState<PayrollPolicy | null>(null);
  const [formData, setFormData] = useState<UpdatePayrollPolicyDto>({
    policyName: '',
    policyType: PolicyType.ALLOWANCE,
    description: '',
    effectiveDate: '',
    ruleDefinition: {
      percentage: 0,
      fixedAmount: 0,
      thresholdAmount: 1,
    },
    applicability: Applicability.AllEmployees,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
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
        setFormData({
          policyName: data.policyName,
          policyType: data.policyType,
          description: data.description,
          effectiveDate: data.effectiveDate.split('T')[0],
          ruleDefinition: data.ruleDefinition,
          applicability: data.applicability,
        });
        if (data.status !== ConfigStatus.DRAFT) {
          alert('Only draft policies can be edited');
          router.push('/payroll-config/policies');
        }
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
    setErrors({});

    if (!formData.policyName?.trim()) {
      setErrors({ policyName: 'Policy Name is required' });
      return;
    }
    if (!formData.description?.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }
    if (!formData.effectiveDate) {
      setErrors({ effectiveDate: 'Effective Date is required' });
      return;
    }

    setLoading(true);
    try {
      // Send the form data as-is; backend will convert date string to Date object
      await payrollPoliciesApi.update(id, formData);
      router.push('/payroll-config/policies');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating policy:', error);
      alert(error.message || 'Failed to update policy');
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[101]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Payroll Policy</h2>
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-1">Policy Name</Label>
                <Input value={formData.policyName || ''} onChange={(e: any) => setFormData({ ...formData, policyName: e.target.value })} required />
                {errors.policyName && <p className="text-sm text-red-600 mt-1">{errors.policyName}</p>}
              </div>

              <div>
                <Label className="mb-1">Policy Type</Label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" value={formData.policyType || PolicyType.ALLOWANCE as any} onChange={(e) => setFormData({ ...formData, policyType: e.target.value as PolicyType })} required>
                  {policyTypeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1">Description</Label>
                <textarea className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label className="mb-1">Effective Date</Label>
                <Input type="date" value={formData.effectiveDate || ''} onChange={(e: any) => setFormData({ ...formData, effectiveDate: e.target.value })} required />
                {errors.effectiveDate && <p className="text-sm text-red-600 mt-1">{errors.effectiveDate}</p>}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rule Definition</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1">Percentage</Label>
                  <Input type="number" min={0} max={100} value={formData.ruleDefinition?.percentage || 0} onChange={(e: any) => setFormData({ ...formData, ruleDefinition: { ...(formData.ruleDefinition || { percentage: 0, fixedAmount: 0, thresholdAmount: 1 }), percentage: parseFloat(e.target.value) || 0 } })} required />
                </div>
                <div>
                  <Label className="mb-1">Fixed Amount</Label>
                  <Input type="number" min={0} value={formData.ruleDefinition?.fixedAmount || 0} onChange={(e: any) => setFormData({ ...formData, ruleDefinition: { ...(formData.ruleDefinition || { percentage: 0, fixedAmount: 0, thresholdAmount: 1 }), fixedAmount: parseFloat(e.target.value) || 0 } })} required />
                </div>
                <div>
                  <Label className="mb-1">Threshold Amount</Label>
                  <Input type="number" min={1} value={formData.ruleDefinition?.thresholdAmount || 1} onChange={(e: any) => setFormData({ ...formData, ruleDefinition: { ...(formData.ruleDefinition || { percentage: 0, fixedAmount: 0, thresholdAmount: 1 }), thresholdAmount: parseFloat(e.target.value) || 1 } })} required />
                </div>
              </div>
            </div>
            <div>
              <Label className="mb-1">Applicability</Label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" value={formData.applicability || Applicability.AllEmployees as any} onChange={(e) => setFormData({ ...formData, applicability: e.target.value as Applicability })} required>
                {applicabilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/policies')}
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

export default function EditPolicyPage() {
  return (
    <Suspense fallback={null}>
      <EditPolicyForm />
    </Suspense>
  );
}

