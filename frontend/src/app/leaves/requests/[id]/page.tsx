'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getLeaveRequestById, cancelLeaveRequest } from '../../../../../services/leaves.service';
import { LeaveRequest } from '../../../../../types/leaves';
import StatusBadge from '../../../../../components/leaves/StatusBadge';
import ApprovalPanel from '../../../../../components/leaves/ApprovalPanel';
import Link from 'next/link';

export default function LeaveRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const requestId = params.id as string;

  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await getLeaveRequestById(requestId);
      setRequest(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!request || !user) return;
    if (!confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      setIsCancelling(true);
      const employeeId = user.employeeId || user.userId;
      await cancelLeaveRequest(request._id, employeeId);
      await loadRequest();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel leave request');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleApprove = async (comments?: string) => {
    if (!request || !user) return;
    // This will be handled by the approval page
    router.push(`/leaves/approvals?requestId=${request._id}`);
  };

  const handleReject = async (reason: string) => {
    if (!request || !user) return;
    router.push(`/leaves/approvals?requestId=${request._id}&action=reject`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error || 'Leave request not found'}</p>
            <Link href="/leaves/dashboard" className="mt-2 text-sm text-red-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = request.status === 'pending' && user?.employeeId === request.employeeId;
  const isOwner = user?.employeeId === request.employeeId || user?.userId === request.employeeId;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/leaves/dashboard"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Leave Request Details</h1>
        </div>

        <div className="space-y-6">
          {/* Request Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Request Information</h2>
              <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Employee</label>
                <p className="text-sm text-gray-900 mt-1">{request.employeeName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Leave Type</label>
                <p className="text-sm text-gray-900 mt-1">
                  {request.leaveTypeName || request.leaveTypeCode || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(request.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(request.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p className="text-sm text-gray-900 mt-1">
                  {request.durationDays} {request.durationDays === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(request.createdAt)}</p>
              </div>
            </div>

            {request.justification && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Justification</label>
                <p className="text-sm text-gray-900 mt-1">{request.justification}</p>
              </div>
            )}

            {request.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <label className="text-sm font-medium text-red-800">Rejection Reason</label>
                <p className="text-sm text-red-700 mt-1">{request.rejectionReason}</p>
              </div>
            )}

            {canCancel && (
              <div className="mt-4">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                </button>
              </div>
            )}
          </div>

          {/* Approval Panel */}
          {(user?.role === 'department head' || user?.role?.includes('HR') || user?.role === 'System Admin') && (
            <ApprovalPanel
              request={request}
              currentUserRole={user.role || ''}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {/* Attachments */}
          {request.hasAttachments && request.attachments && request.attachments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
              <div className="space-y-2">
                {request.attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded by {attachment.uploadedByName || 'N/A'} on{' '}
                        {formatDate(attachment.uploadedAt)}
                      </p>
                    </div>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

