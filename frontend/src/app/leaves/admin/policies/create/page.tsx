'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeavesService } from '../../../../../services/leaves.service';

export default function CreatePolicyPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        paid: true,
        deductible: true,
        requiresAttachment: false
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await LeavesService.createLeaveType(formData);
            router.push('/leaves/admin/policies');
        } catch (err) {
            console.error(err);
            alert('Failed to create policy');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Leave Type</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Annual Leave"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                            <input
                                required
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. ANN"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.paid}
                                onChange={e => setFormData({ ...formData, paid: e.target.checked })}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Paid Leave</span>
                                <span className="block text-xs text-gray-500">Employee receives salary during this leave.</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.deductible}
                                onChange={e => setFormData({ ...formData, deductible: e.target.checked })}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Deductible from Annual Balance</span>
                                <span className="block text-xs text-gray-500">Reduces the employee's available vacation days.</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.requiresAttachment}
                                onChange={e => setFormData({ ...formData, requiresAttachment: e.target.checked })}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Requires Attachment</span>
                                <span className="block text-xs text-gray-500">e.g. Medical certificate or document.</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Policy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
