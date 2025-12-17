'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeavesService } from '../../../services/leaves.service';
import { LeaveRequest, LeaveStatus } from '../../../types/leaves';
import LeaveStatusBadge from '../../components/LeaveStatusBadge';

export default function ApprovalDashboard() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        try {
            const data = await LeavesService.getPendingApprovals();
            setRequests(data);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(id: string, status: LeaveStatus.APPROVED | LeaveStatus.REJECTED) {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;
        setActionId(id);
        try {
            await LeavesService.processRequest(id, status);
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            console.error(err);
            alert('Action failed');
        } finally {
            setActionId(null);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Approvals</h1>
                <p className="text-gray-500 mb-8">Review and process leave requests from your team.</p>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading pending requests...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Leave Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Justification</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {requests.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No pending approvals. Good job!</td></tr>
                                ) : requests.map(req => (
                                    <tr key={req._id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{req.employeeName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{req.leaveTypeName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{req.durationDays} days</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                                            {req.justification || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction(req._id, LeaveStatus.APPROVED)}
                                                    disabled={actionId === req._id}
                                                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req._id, LeaveStatus.REJECTED)}
                                                    disabled={actionId === req._id}
                                                    className="px-3 py-1 bg-white border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
