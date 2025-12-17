'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeavesService } from '../../../../services/leaves.service';
import { LeaveType } from '../../../../types/leaves';

export default function LeavePoliciesPage() {
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await LeavesService.getLeaveTypes();
                setTypes(data);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leave Policies</h1>
                        <p className="text-gray-500">Configure leave types and entitlement rules.</p>
                    </div>
                    <Link
                        href="/leaves/admin/policies/create"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        + Create Leave Type
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading policies...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {types.map(type => (
                            <div key={type._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded text-sm">
                                        {type.code}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${type.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {type.paid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{type.description || 'No description provided.'}</p>

                                <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                                    <div className="flex justify-between">
                                        <span>Deductible:</span>
                                        <span className="font-medium">{type.deductible ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Requires Proof:</span>
                                        <span className="font-medium">{type.requiresAttachment ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
