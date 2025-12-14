'use client';

import React, { useState, useEffect } from 'react';
import { LeaveType, CreateLeaveRequestDto, LeaveValidationResult } from '../../types/leaves';
import { getLeaveTypes, validateLeaveRequest } from '../../services/leaves.service';

interface LeaveRequestFormProps {
  employeeId: string;
  onSubmit: (data: CreateLeaveRequestDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function LeaveRequestForm({
  employeeId,
  onSubmit,
  onCancel,
  isLoading = false,
}: LeaveRequestFormProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [justification, setJustification] = useState('');
  const [isPostLeave, setIsPostLeave] = useState(false);
  const [validation, setValidation] = useState<LeaveValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  useEffect(() => {
    if (selectedLeaveType && startDate && endDate) {
      validateDates();
    }
  }, [selectedLeaveType, startDate, endDate]);

  const loadLeaveTypes = async () => {
    try {
      const types = await getLeaveTypes();
      setLeaveTypes(types.filter((type) => type.isActive));
    } catch (error) {
      console.error('Failed to load leave types:', error);
      setErrors({ general: 'Failed to load leave types. Please refresh the page.' });
    }
  };

  const validateDates = async () => {
    if (!selectedLeaveType || !startDate || !endDate) return;

    if (new Date(startDate) > new Date(endDate)) {
      setErrors({ dates: 'End date must be after start date' });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateLeaveRequest(employeeId, selectedLeaveType, startDate, endDate);
      setValidation(result);
      if (!result.isValid) {
        setErrors({ validation: result.errors.join(', ') });
      } else {
        setErrors({});
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDuration = (): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!selectedLeaveType || !startDate || !endDate) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }

    if (validation && !validation.isValid) {
      setErrors({ validation: validation.errors.join(', ') });
      return;
    }

    try {
      await onSubmit({
        employeeId,
        leaveTypeId: selectedLeaveType,
        dates: {
          from: startDate,
          to: endDate,
        },
        justification: justification.trim() || undefined,
        isPostLeave,
      });
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to submit leave request' });
    }
  };

  const selectedType = leaveTypes.find((type) => type._id === selectedLeaveType);
  const duration = calculateDuration();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      {errors.validation && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{errors.validation}</p>
        </div>
      )}

      {validation?.warnings && validation.warnings.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Warnings:</p>
          <ul className="list-disc list-inside text-sm text-blue-700">
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Leave Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Leave Type <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedLeaveType}
          onChange={(e) => setSelectedLeaveType(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select leave type</option>
          {leaveTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.name} {type.requiresAttachment && '(Requires attachment)'}
            </option>
          ))}
        </select>
        {selectedType && (
          <p className="mt-1 text-xs text-gray-500">{selectedType.description}</p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.dates && <p className="mt-1 text-xs text-red-600">{errors.dates}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Duration Display */}
      {startDate && endDate && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Duration:</strong> {duration} {duration === 1 ? 'day' : 'days'}
          </p>
          {validation?.excessDays && validation.excessDays > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              <strong>Excess Days:</strong> {validation.excessDays} days
              {validation.canConvertToUnpaid && ' (Can be converted to unpaid leave)'}
            </p>
          )}
        </div>
      )}

      {/* Team Conflicts */}
      {validation?.teamConflicts && validation.teamConflicts.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-2">Team Conflicts:</p>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {validation.teamConflicts.map((conflict, index) => (
              <li key={index}>
                {conflict.employeeName} ({conflict.overlapDays} days overlap)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Justification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Justification
        </label>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Please provide a reason for this leave request..."
        />
      </div>

      {/* Post-Leave Submission */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="postLeave"
          checked={isPostLeave}
          onChange={(e) => setIsPostLeave(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="postLeave" className="ml-2 block text-sm text-gray-700">
          This is a post-leave submission (within grace period)
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading || isValidating || (validation && !validation.isValid)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : isValidating ? 'Validating...' : 'Submit Request'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

