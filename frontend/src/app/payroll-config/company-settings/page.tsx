'use client';

import React, { useState, useEffect } from 'react';
import { companySettingsApi } from '@/app/payroll-config/client';
import { CompanySettings, CreateCompanySettingsDto, UpdateCompanySettingsDto } from '@/types/payroll-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateReadable } from '@/lib/format';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateCompanySettingsDto>({
    payDate: '',
    timeZone: '',
    currency: 'EGP',
  });

  const router = useRouter();
  const user = getCurrentUser();
  const userRole = user?.role || '';

  // REQ-PY-15: Only System Admin can access company settings
  useEffect(() => {
    if (userRole && userRole !== 'System Admin') {
      alert('Access Denied: Only System Admins can access company settings.');
      router.push('/payroll-config');
      return;
    }
  }, [userRole, router]);

  useEffect(() => {
    if (userRole === 'System Admin') {
      loadSettings();
    }
  }, [userRole]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await companySettingsApi.get();
      setSettings(data);
      if (data) {
        setFormData({
          payDate: data.payDate ? new Date(data.payDate).toISOString().split('T')[0] : '',
          timeZone: data.timeZone || '',
          currency: data.currency || 'EGP',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Settings might not exist yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (settings) {
      setFormData({
        payDate: settings.payDate ? new Date(settings.payDate).toISOString().split('T')[0] : '',
        timeZone: settings.timeZone || '',
        currency: settings.currency || 'EGP',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (settings) {
        await companySettingsApi.update(formData);
      } else {
        await companySettingsApi.create(formData as CreateCompanySettingsDto);
      }
      setIsEditModalOpen(false);
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      const message = error instanceof Error ? error.message : 'Failed to save settings';
      alert(message);
    }
  };

  const timeZoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  ];

  const currencyOptions = [
    { value: 'EGP', label: 'EGP - Egyptian Pound' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
  ];

  // Don't render anything for non-System Admins
  if (userRole && userRole !== 'System Admin') {
    return null;
  }

  if (loading) {
    return null; // Let the loading.tsx handle the loading state
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground">Company Settings</h1>
            <p className="text-muted-foreground text-sm">Pay dates, time zone, and currency for payroll runs.</p>
          </div>
          <Button onClick={handleEdit}>{settings ? 'Edit settings' : 'Create settings'}</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Current settings</CardTitle>
            <CardDescription>These values are used across payroll execution and reports.</CardDescription>
          </CardHeader>
          <CardContent>
            {settings ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pay date</p>
                  <p className="text-base font-medium text-foreground">{formatDateReadable(settings.payDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time zone</p>
                  <p className="text-base font-medium text-foreground">{settings.timeZone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="text-base font-medium text-foreground">{settings.currency || 'EGP'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-base font-medium text-foreground">No company settings configured yet.</p>
                  <p className="text-sm text-muted-foreground">Set a default pay date, time zone, and currency.</p>
                </div>
                <Button onClick={handleEdit}>Create settings</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{settings ? 'Edit company settings' : 'Create company settings'}</DialogTitle>
              <DialogDescription>These values determine payroll time zone, currency, and pay date.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payDate">Pay date</Label>
                <Input
                  id="payDate"
                  type="date"
                  value={formData.payDate}
                  onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeZone">Time zone</Label>
                <select
                  id="timeZone"
                  value={formData.timeZone}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select time zone</option>
                  {timeZoneOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {currencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter className="justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{settings ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

