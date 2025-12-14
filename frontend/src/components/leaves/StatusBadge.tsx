'use client';

import React from 'react';
import { LeaveStatus } from '../../types/leaves';

interface StatusBadgeProps {
  status: LeaveStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<LeaveStatus, { label: string; className: string }> = {
  [LeaveStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [LeaveStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  [LeaveStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  [LeaveStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  [LeaveStatus.ESCALATED]: {
    label: 'Escalated',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  [LeaveStatus.ENCASHED]: {
    label: 'Encashed',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}

