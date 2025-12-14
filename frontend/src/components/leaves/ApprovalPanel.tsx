'use client';

import React, { useState } from 'react';
import { LeaveRequest, ApprovalStep } from '../../types/leaves';
import StatusBadge from './StatusBadge';

interface ApprovalPanelProps {
  request: LeaveRequest;
  currentUserRole: string;
  onApprove: (comments?: string) => void;
  onReject: (reason: string) => void;
  onOverride?: (reason: string) => void;
  isLoading?: boolean;
}

export default function ApprovalPanel({
  request,
  currentUserRole,
  onApprove,
  onReject,
  onOverride,
  isLoading = false,
}: ApprovalPanelProps) {
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentStep = (): ApprovalStep | undefined => {
    return request.approvalFlow.find(
      (step) => step.status === 'PENDING' && step.role === currentUserRole
    );
  };

  const currentStep = getCurrentStep();
  const canApprove = currentStep && currentStep.status === 'PENDING';
  const isHR = currentUserRole.includes('HR') || currentUserRole === 'System Admin';

  const handleApprove = () => {
    if (canApprove) {
      onApprove(comments);
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
      setShowRejectForm(false);
      setRejectionReason('');
    }
  };

  const handleOverride = () => {
    if (onOverride && rejectionReason.trim()) {
      onOverride(rejectionReason);
      setShowOverrideForm(false);
      setRejectionReason('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Workflow</h3>

      {/* Approval Flow Steps */}
      <div className="space-y-3 mb-6">
        {request.approvalFlow.map((step, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              step.status === 'APPROVED'
                ? 'bg-green-50 border-green-200'
                : step.status === 'REJECTED'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step.status === 'APPROVED'
                    ? 'bg-green-500 text-white'
                    : step.status === 'REJECTED'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900">{step.role}</div>
                {step.decidedBy && (
                  <div className="text-xs text-gray-500">
                    {step.decidedByName || 'N/A'} - {formatDate(step.decidedAt)}
                  </div>
                )}
                {step.comments && (
                  <div className="text-xs text-gray-600 mt-1">{step.comments}</div>
                )}
              </div>
            </div>
            <div>
              {step.status === 'PENDING' ? (
                <span className="text-xs text-gray-500">Pending</span>
              ) : step.status === 'APPROVED' ? (
                <span className="text-xs text-green-600 font-medium">Approved</span>
              ) : (
                <span className="text-xs text-red-600 font-medium">Rejected</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Warning */}
      {request.isEscalated && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Escalated:</strong> This request has been escalated due to timeout. Action
            required.
          </p>
        </div>
      )}

      {/* Approval Actions */}
      {canApprove && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any comments or notes..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
            {isHR && onOverride && (
              <button
                onClick={() => setShowOverrideForm(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Override
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reject Form Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Request</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder="Please provide a reason for rejection..."
              required
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Form Modal */}
      {showOverrideForm && onOverride && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Override Decision</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder="Please provide justification for override..."
              required
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleOverride}
                disabled={!rejectionReason.trim() || isLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Override
              </button>
              <button
                onClick={() => {
                  setShowOverrideForm(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

