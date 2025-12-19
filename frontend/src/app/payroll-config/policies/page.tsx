'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { payrollPoliciesApi } from '@/app/payroll-config/client';
import { PayrollPolicy, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateReadable } from '@/lib/format';
import { getCurrentUser } from '@/lib/auth';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

function PayrollPoliciesPage() {
  const [policies, setPolicies] = useState<PayrollPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = getCurrentUser();
  const userRole = user?.role || '';
  
  // REQ-PY-1: Payroll Specialist & Manager can create/edit, Manager+ can approve/delete
  const canCreate = ['Payroll Specialist', 'Payroll Manager', 'HR Manager', 'System Admin'].includes(userRole);
  const canApprove = ['Payroll Manager', 'HR Manager', 'System Admin'].includes(userRole);
  const canDelete = ['Payroll Manager', 'HR Manager', 'System Admin'].includes(userRole);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await payrollPoliciesApi.getAll();
      setPolicies(data);
    } catch (error) {
      console.error('Error loading policies:', error);
      alert('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policy: PayrollPolicy) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      await payrollPoliciesApi.delete(policy._id);
      loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete policy';
      alert(message);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground">Payroll Policies</h1>
            <p className="text-muted-foreground text-sm">
              Configure company-level payroll policies and manage their approval status.
            </p>
          </div>
          {canCreate && (
            <Link href="/payroll-config/policies?create=true">
              <Button>Create policy</Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Policy list</CardTitle>
            <CardDescription>All payroll policies with type, applicability, status, and actions.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applicability</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => {
                  const status = policy.status.toLowerCase() as 'draft' | 'approved' | 'rejected';
                  // Payroll Specialist can only edit drafts (REQ-PY-1)
                  const canEditThis = userRole === 'Payroll Specialist' 
                    ? (status === 'draft' && canCreate) 
                    : (userRole === 'Payroll Manager' || userRole === 'System Admin');
                  
                  return (
                    <TableRow key={policy._id}>
                      <TableCell className="font-medium">{policy.policyName}</TableCell>
                      <TableCell>{policy.policyType}</TableCell>
                      <TableCell>{policy.applicability}</TableCell>
                      <TableCell>{formatDateReadable(policy.effectiveDate)}</TableCell>
                      <TableCell>
                        {(() => {
                          const map: Record<string, { label: string; variant: BadgeVariant }> = {
                            [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                            [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                            [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                          };
                          const s = map[policy.status] || { label: policy.status, variant: 'default' };
                          return <Badge variant={s.variant}>{s.label}</Badge>;
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {canEditThis && (
                            <Link href={`/payroll-config/policies?edit=${policy._id}`}>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                            </Link>
                          )}
                          {canApprove && (
                            <Link href={`/payroll-config/policies?status=${policy._id}`}>
                              <Button size="sm" variant="secondary">
                                Change status
                              </Button>
                            </Link>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(policy)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PayrollPoliciesPage;

