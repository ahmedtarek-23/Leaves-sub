'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LeavesService } from '../../services/leaves.service';
import { UserBalance } from '../../types/leaves';

export default function LeavesDashboard() {
    const [balance, setBalance] = useState<UserBalance | null>(null);

    useEffect(() => {
        async function load() {
            const bal = await LeavesService.getBalance();
            setBalance(bal);
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Leaves Management</h1>

                {/* Quick Stats / Balance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                        <h3 className="text-gray-500 font-medium">Annual Leave Balance</h3>
                        <div className="text-4xl font-bold text-gray-900">
                            {balance ? balance.remaining : '-'}
                            <span className="text-lg text-gray-400 font-normal ml-2">days</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                            <div
                                className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                                style={{ width: balance ? `${(balance.remaining / balance.annualQuota) * 100}%` : '0%' }}
                            ></div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white flex flex-col justify-between h-40">
                        <div>
                            <h3 className="font-semibold text-lg opacity-90">Need time off?</h3>
                            <p className="text-indigo-100 text-sm mt-1">Submit a new leave request in seconds.</p>
                        </div>
                        <Link
                            href="/leaves/request"
                            className="self-start px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition"
                        >
                            Request Leave
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                        <div>
                            <h3 className="text-gray-900 font-semibold text-lg">My History</h3>
                            <p className="text-gray-500 text-sm mt-1">View past leaves and check status.</p>
                        </div>
                        <Link
                            href="/leaves/request/history"
                            className="self-start text-indigo-600 font-medium hover:underline flex items-center gap-1"
                        >
                            View All Requests →
                        </Link>
                    </div>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/leaves/approval" className="group block p-6 bg-white rounded-xl border border-gray-100 hover:border-indigo-600 hover:shadow-md transition-all">
                        <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Team Approvals</div>
                        <p className="text-sm text-gray-500 mt-1">Manager Only • Review pending requests</p>
                    </Link>

                    <Link href="/leaves/admin/policies" className="group block p-6 bg-white rounded-xl border border-gray-100 hover:border-indigo-600 hover:shadow-md transition-all">
                        <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Policy Configuration</div>
                        <p className="text-sm text-gray-500 mt-1">Admin Only • Manage leave types</p>
                    </Link>
                </div>

            </div>
        </div>
    );
}
