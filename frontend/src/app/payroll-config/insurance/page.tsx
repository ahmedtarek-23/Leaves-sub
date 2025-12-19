'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { insuranceApi } from '@/app/payroll-config/client';
import { InsuranceBracket, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import { getCurrentUser } from '@/lib/auth';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export default function InsurancePage() {
  const [insuranceBrackets, setInsuranceBrackets] = useState<InsuranceBracket[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();
  const userRole = user?.role || '';

  // REQ-PY-22: Only HR Manager and System Admin can edit/approve/delete insurance
  const canManageInsurance = userRole === 'HR Manager' || userRole === 'System Admin';

  useEffect(() => {
    loadInsuranceBrackets();
  }, []);

  const loadInsuranceBrackets = async () => {
    try {
      setLoading(true);
      const data = await insuranceApi.getAll();
      setInsuranceBrackets(data);
    } catch (error) {
      console.error('Error loading insurance brackets:', error);
      alert('Failed to load insurance brackets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (insurance: InsuranceBracket) => {
    if (!confirm('Are you sure you want to delete this insurance bracket?')) return;

    try {
      await insuranceApi.delete(insurance._id);
      loadInsuranceBrackets();
    } catch (error) {
      console.error('Error deleting insurance bracket:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete insurance bracket';
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
            <h1 className="text-3xl font-semibold text-foreground">Insurance Brackets</h1>
            <p className="text-muted-foreground text-sm">Bracket salary ranges and contribution rates.</p>
          </div>
          {canManageInsurance && (
            <Link href="/payroll-config/insurance?create=true">
              <Button>Create insurance bracket</Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Insurance bracket list</CardTitle>
            <CardDescription>Salary thresholds with employee and employer rates.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Min salary</TableHead>
                  <TableHead>Max salary</TableHead>
                  <TableHead>Employee rate (%)</TableHead>
                  <TableHead>Employer rate (%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceBrackets.map((insurance) => {
                  return (
                    <TableRow key={insurance._id}>
                      <TableCell className="font-medium">{insurance.name}</TableCell>
                      <TableCell>{formatNumber(insurance.minSalary)}</TableCell>
                      <TableCell>{formatNumber(insurance.maxSalary)}</TableCell>
                      <TableCell>{insurance.employeeRate}%</TableCell>
                      <TableCell>{insurance.employerRate}%</TableCell>
                      <TableCell>
                        {(() => {
                          const map: Record<string, { label: string; variant: BadgeVariant }> = {
                            [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                            [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                            [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                          };
                          const s = map[insurance.status] || { label: insurance.status, variant: 'default' };
                          return <Badge variant={s.variant}>{s.label}</Badge>;
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {canManageInsurance ? (
                            <>
                              <Link href={`/payroll-config/insurance?edit=${insurance._id}`}>
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/payroll-config/insurance?status=${insurance._id}`}>
                                <Button size="sm" variant="secondary">
                                  Change status
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(insurance)}
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">View Only</span>
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
