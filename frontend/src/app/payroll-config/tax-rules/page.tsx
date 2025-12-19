'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { taxRulesApi } from '@/app/payroll-config/client';
import { TaxRule, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

function TaxRulesPage() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = getCurrentUser();
  const userRole = user?.role || '';
  
  // REQ-PY-10: Payroll Specialist & Manager can create/edit, Manager+ can approve/delete
  const canCreate = ['Payroll Manager', 'HR Manager', 'System Admin'].includes(userRole);
  const canApprove = ['Payroll Manager', 'HR Manager', 'System Admin'].includes(userRole);
  const canDelete = ['Payroll Manager', 'HR Manager', 'System Admin'].includes(userRole);

  useEffect(() => {
    loadTaxRules();
  }, []);

  const loadTaxRules = async () => {
    try {
      setLoading(true);
      const data = await taxRulesApi.getAll();
      setTaxRules(data);
    } catch (error) {
      console.error('Error loading tax rules:', error);
      alert('Failed to load tax rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taxRule: TaxRule) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;

    try {
      await taxRulesApi.delete(taxRule._id);
      loadTaxRules();
    } catch (error) {
      console.error('Error deleting tax rule:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete tax rule';
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
            <h1 className="text-3xl font-semibold text-foreground">Tax Rules</h1>
            <p className="text-muted-foreground text-sm">Manage tax rates with approval workflows.</p>
          </div>
          {canCreate && (
            <Link href="/payroll-config/tax-rules?create=true">
              <Button>Create tax rule</Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tax rule list</CardTitle>
            <CardDescription>All tax rules with rates, status, and quick actions.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Rate (%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRules.map((taxRule) => {
                  const status = taxRule.status.toLowerCase() as 'draft' | 'approved' | 'rejected';
                  // Payroll Specialist can only edit drafts (REQ-PY-10)
                  const canEditThis = userRole === 'Payroll Specialist' 
                    ? (status === 'draft' && canCreate) 
                    : (userRole === 'Payroll Manager' || userRole === 'System Admin');
                  
                  return (
                  <TableRow key={taxRule._id}>
                    <TableCell className="font-medium">{taxRule.name}</TableCell>
                    <TableCell className="max-w-xl">{taxRule.description || 'N/A'}</TableCell>
                    <TableCell>{taxRule.rate}%</TableCell>
                    <TableCell>
                      {(() => {
                        const map: Record<string, { label: string; variant: BadgeVariant }> = {
                          [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                          [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                          [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                        };
                        const s = map[taxRule.status] || { label: taxRule.status, variant: 'default' };
                        return <Badge variant={s.variant}>{s.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {canEditThis && (
                          <Link href={`/payroll-config/tax-rules?edit=${taxRule._id}`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                        )}
                        {canApprove && (
                          <Link href={`/payroll-config/tax-rules?status=${taxRule._id}`}>
                            <Button size="sm" variant="secondary">
                              Change status
                            </Button>
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(taxRule)}
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

export default TaxRulesPage;

