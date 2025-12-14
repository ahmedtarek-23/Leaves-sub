'use client';

import React from 'react';

interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  size?: 'sm' | 'md';
}

const priorityConfig = {
  LOW: {
    label: 'Low',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  HIGH: {
    label: 'High',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}

