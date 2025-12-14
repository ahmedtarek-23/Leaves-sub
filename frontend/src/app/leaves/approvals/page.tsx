'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getLeaveRequests,
  reviewLeaveRequest,
  getLeaveBalances,
} from '../../../services/leaves.service';
import { LeaveRequest, LeaveBalance, LeaveStatus } from '../../../types/leaves';
import LeaveRequestTable from '../../../components/leaves/LeaveRequestTable';
import ApprovalPanel from '../../../components/leaves/ApprovalPanel';
import StatusBadge from '../../../components/leaves/StatusBadge';

export default function ManagerApprovalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isManager } = useAuth();
  const requestId = searchParams.get('requestId');

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [employeeBalances, setEmployeeBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isManager()) {
      router.push('/leaves/dashboard');
      return;
    }
    loadRequests();
  }, [user]);

  useEffect(() => {
    if (requestId) {
      const request = requests.find((r) => r._id === requestId);
      if (request) {
        setSelectedRequest(request);
        loadEmployeeBalances(request.employeeId);
      }
    }
  }, [requestId, requests]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const managerId = user?.employeeId || user?.userId;
      const data = await getLeaveRequests({
        managerId,
        status: LeaveStatus.PENDING,
      });
      setRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeBalances = async (employeeId: string) => {
    try {
      const balances = await getLeaveBalances(employeeId);
      setEmployeeBalances(balances);
    } catch (err) {
      console.error('Failed to load employee balances:', err);
    }
  };

  const handleApprove = async (comments?: string) => {
    if (!selectedRequest || !user) return;

    try {
      setIsProcessing(true);
      await reviewLeaveRequest(selectedRequest._id, {
        approverId: user.employeeId || user.userId,
        action: 'APPROVE',
        isHR: false,
        comments,
      });
      await loadRequests();
      setSelectedRequest(null);
      router.push('/leaves/approvals');
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest || !user) return;

    try {
      setIsProcessing(true);
      await reviewLeaveRequest(selectedRequest._id, {
        approverId: user.employeeId || user.userId,
        action: 'REJECT',
        isHR: false,
        reason,
      });
      await loadRequests();
      setSelectedRequest(null);
      router.push('/leaves/approvals');
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    loadEmployeeBalances(request.employeeId);
    router.push(`/leaves/approvals?requestId=${request._id}`);
  };

  if (!isManager()) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve leave requests from your team members.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
                <p className="text-gray-500 text-sm">Loading requests...</p>
              </div>
            ) : (
              <LeaveRequestTable
                requests={requests}
                showEmployee={true}
                showActions={true}
                onAction={(id, action) => {
                  const request = requests.find((r) => r._id === id);
                  if (request) handleViewDetails(request);
                }}
              />
            )}
          </div>

          {/* Approval Panel */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="space-y-6">
                <ApprovalPanel
                  request={selectedRequest}
                  currentUserRole={user?.role || ''}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={isProcessing}
                />

                {/* Employee Balance Snapshot */}
                {employeeBalances.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Employee Balance Snapshot
                    </h4>
                    <div className="space-y-2">
                      {employeeBalances
                        .filter((b) => b.leaveTypeCode === selectedRequest.leaveTypeCode)
                        .map((balance) => (
                          <div key={balance.leaveTypeCode} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remaining:</span>
                              <span className="font-medium text-gray-900">
                                {balance.remaining.toFixed(1)} days
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pending:</span>
                              <span className="font-medium text-gray-900">
                                {balance.pending.toFixed(1)} days
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500">Select a request to review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

