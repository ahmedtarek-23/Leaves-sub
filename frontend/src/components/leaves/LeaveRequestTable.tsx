'use client';

import React from 'react';
import Link from 'next/link';
import { LeaveRequest } from '../../types/leaves';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  showEmployee?: boolean;
  showActions?: boolean;
  onAction?: (requestId: string, action: string) => void;
}

export default function LeaveRequestTable({
  requests,
  showEmployee = false,
  showActions = false,
  onAction,
}: LeaveRequestTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (requests.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
        <p className="text-gray-500 text-sm">No leave requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {showEmployee && (
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Employee
              </th>
            )}
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Leave Type
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Dates
            </th>
            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Duration
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Status
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              Submitted
            </th>
            {showActions && (
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id} className="hover:bg-gray-50 transition-colors">
              {showEmployee && (
                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                  {request.employeeName || 'N/A'}
                </td>
              )}
              <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                {request.leaveTypeName || request.leaveTypeCode || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                <div>
                  <div>{formatDate(request.startDate)}</div>
                  <div className="text-xs text-gray-500">to {formatDate(request.endDate)}</div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right border-b border-gray-100">
                {request.durationDays} {request.durationDays === 1 ? 'day' : 'days'}
              </td>
              <td className="px-4 py-3 text-sm border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <StatusBadge status={request.status} size="sm" />
                  {request.flagged && request.flagPriority && (
                    <PriorityBadge priority={request.flagPriority} size="sm" />
                  )}
                  {request.isEscalated && (
                    <span className="text-xs text-orange-600 font-medium">Escalated</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                {formatDate(request.createdAt)}
              </td>
              {showActions && (
                <td className="px-4 py-3 text-sm border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/leaves/requests/${request._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </Link>
                    {onAction && request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onAction(request._id, 'approve')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onAction(request._id, 'reject')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

