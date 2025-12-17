'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeavesService } from '../../../services/leaves.service';
import { LeaveType } from '../../../types/leaves';

export default function RequestLeavePage() {
    const router = useRouter();
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        justification: ''
    });

    useEffect(() => {
        async function load() {
            try {
                const data = await LeavesService.getLeaveTypes();
                setTypes(data);
                if (data.length > 0) setFormData(prev => ({ ...prev, leaveTypeId: data[0]._id }));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Simple duration calc (mock)
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            await LeavesService.submitRequest({
                ...formData,
                durationDays
            });
            router.push('/leaves/request/history');
        } catch (err) {
            console.error(err);
            alert('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    }

    const selectedType = types.find(t => t._id === formData.leaveTypeId);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading leave types...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Request Leave</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                        <select
                            value={formData.leaveTypeId}
                            onChange={e => setFormData({ ...formData, leaveTypeId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            {types.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                        {selectedType && (
                            <p className="text-xs text-gray-500 mt-1">{selectedType.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                required
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                required
                                type="date"
                                value={formData.endDate}
                                min={formData.startDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
                        <textarea
                            value={formData.justification}
                            onChange={e => setFormData({ ...formData, justification: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Reason for leave..."
                        />
                    </div>

                    {selectedType?.requiresAttachment && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800 font-medium mb-1">Attachment Required</p>
                            <p className="text-xs text-blue-600 mb-3">Please upload a {selectedType.attachmentType} document.</p>
                            <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
