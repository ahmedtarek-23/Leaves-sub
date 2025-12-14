'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getLeaveRequests,
  reviewLeaveRequest,
  verifyMedicalDocuments,
  flagLeaveRequest,
} from '../../../services/leaves.service';
import { LeaveRequest } from '../../../types/leaves';
import LeaveRequestTable from '../../../components/leaves/LeaveRequestTable';
import ApprovalPanel from '../../../components/leaves/ApprovalPanel';
import StatusBadge from '../../../components/leaves/StatusBadge';
import PriorityBadge from '../../../components/leaves/PriorityBadge';

export default function HRReviewPage() {
  const router = useRouter();
  const { user, isHR } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'flagged'>('pending');

  useEffect(() => {
    if (!isHR()) {
      router.push('/leaves/dashboard');
      return;
    }
    loadRequests();
  }, [user, filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'pending' ? 'approved' : filter === 'all' ? undefined : filter;
      const data = await getLeaveRequests({
        status: statusFilter as any,
        ...(filter === 'flagged' ? { flagged: true } : {}),
      });
      setRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (comments?: string) => {
    if (!selectedRequest || !user) return;

    try {
      setIsProcessing(true);
      await reviewLeaveRequest(selectedRequest._id, {
        approverId: user.employeeId || user.userId,
        action: 'APPROVE',
        isHR: true,
        comments,
      });
      await loadRequests();
      setSelectedRequest(null);
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
        isHR: true,
        reason,
      });
      await loadRequests();
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverride = async (reason: string) => {
    if (!selectedRequest || !user) return;

    try {
      setIsProcessing(true);
      await reviewLeaveRequest(selectedRequest._id, {
        approverId: user.employeeId || user.userId,
        action: 'OVERRIDE',
        isHR: true,
        reason,
      });
      await loadRequests();
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.message || 'Failed to override request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyMedical = async (isValid: boolean, comments?: string) => {
    if (!selectedRequest || !user) return;

    try {
      setIsProcessing(true);
      await verifyMedicalDocuments(
        selectedRequest._id,
        user.employeeId || user.userId,
        isValid,
        comments
      );
      await loadRequests();
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.message || 'Failed to verify medical documents');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlag = async (reason: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    if (!selectedRequest || !user) return;

    try {
      setIsProcessing(true);
      await flagLeaveRequest(selectedRequest._id, user.employeeId || user.userId, reason, priority);
      await loadRequests();
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.message || 'Failed to flag request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isHR()) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">HR Review</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review manager-approved requests, verify documents, and apply overrides.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'flagged'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Flagged
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
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
                showActions={false}
              />
            )}
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="space-y-6">
                <ApprovalPanel
                  request={selectedRequest}
                  currentUserRole={user?.role || ''}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onOverride={handleOverride}
                  isLoading={isProcessing}
                />

                {/* Medical Verification */}
                {selectedRequest.hasAttachments && selectedRequest.leaveTypeCode?.includes('MEDICAL') && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Medical Verification</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleVerifyMedical(true)}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Verify Valid
                      </button>
                      <button
                        onClick={() => {
                          const comments = prompt('Enter verification comments:');
                          if (comments) handleVerifyMedical(false, comments);
                        }}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Mark Invalid
                      </button>
                    </div>
                  </div>
                )}

                {/* Flagging */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Flag Request</h4>
                  <div className="space-y-2">
                    {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => {
                          const reason = prompt(`Enter reason for ${priority} priority flag:`);
                          if (reason) handleFlag(reason, priority as 'LOW' | 'MEDIUM' | 'HIGH');
                        }}
                        className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                      >
                        Flag as {priority}
                      </button>
                    ))}
                  </div>
                </div>
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

