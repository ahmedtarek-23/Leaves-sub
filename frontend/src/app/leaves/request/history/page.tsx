'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeavesService } from '../../../../services/leaves.service';
import { LeaveRequest } from '../../../../types/leaves';
import LeaveStatusBadge from '../../components/LeaveStatusBadge';

export default function RequestHistoryPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await LeavesService.getMyRequests();
                setRequests(data);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
                    <Link
                        href="/leaves/request"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                        + New Request
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading requests...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Leave Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Submitted On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {requests.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No requests found.</td></tr>
                                ) : requests.map(req => (
                                    <tr key={req._id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{req.leaveTypeName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{req.durationDays} days</td>
                                        <td className="px-6 py-4">
                                            <LeaveStatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
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
