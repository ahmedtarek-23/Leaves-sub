'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getLeaveTypes,
  getLeavePolicies,
  createLeaveType,
  updateLeaveType,
  activateLeaveType,
  createLeavePolicy,
  updateLeavePolicy,
} from '../../../services/leaves.service';
import {
  LeaveType,
  LeavePolicy,
  CreateLeaveTypeDto,
  CreateLeavePolicyDto,
  AccrualMethod,
} from '../../../types/leaves';

export default function PolicyConfigurationPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'types' | 'policies'>('types');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);

  useEffect(() => {
    if (!isAdmin()) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, policiesData] = await Promise.all([
        getLeaveTypes(),
        getLeavePolicies(),
      ]);
      setLeaveTypes(types);
      setPolicies(policiesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async (data: CreateLeaveTypeDto) => {
    try {
      await createLeaveType(data);
      await loadData();
      setShowTypeForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create leave type');
    }
  };

  const handleUpdateType = async (typeId: string, data: Partial<CreateLeaveTypeDto>) => {
    try {
      await updateLeaveType(typeId, data);
      await loadData();
      setEditingType(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update leave type');
    }
  };

  const handleToggleTypeActive = async (typeId: string, isActive: boolean) => {
    try {
      await activateLeaveType(typeId, isActive);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update leave type');
    }
  };

  const handleCreatePolicy = async (data: CreateLeavePolicyDto) => {
    try {
      await createLeavePolicy(data);
      await loadData();
      setShowPolicyForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create policy');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">Access denied. Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leave Policy Configuration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure leave types, entitlements, accrual rules, and approval workflows.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('types')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Leave Types
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'policies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Policies
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {activeTab === 'types' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Leave Types</h2>
                  <button
                    onClick={() => {
                      setEditingType(null);
                      setShowTypeForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Leave Type
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paid</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Deductible
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveTypes.map((type) => (
                        <tr key={type._id} className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-900">{type.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{type.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {type.paid ? 'Yes' : 'No'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {type.deductible ? 'Yes' : 'No'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                type.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {type.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleToggleTypeActive(type._id, !type.isActive)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              {type.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingType(type);
                                setShowTypeForm(true);
                              }}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Leave Policies</h2>
                  <button
                    onClick={() => {
                      setEditingPolicy(null);
                      setShowPolicyForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Policy
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Accrual Method
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Max Carry-Forward
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.map((policy) => (
                        <tr key={policy._id} className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-900">{policy.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{policy.accrualMethod}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {policy.maxCarryForward} days
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                policy.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {policy.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => {
                                setEditingPolicy(policy);
                                setShowPolicyForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

