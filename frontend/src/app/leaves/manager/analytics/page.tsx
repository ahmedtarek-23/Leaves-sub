"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
import { LeaveRequest, LeaveType } from "@/types/leaves";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
    totalRequests: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    cancelledCount: number;
    leaveTypeDistribution: { [key: string]: number };
    departmentDistribution: { [key: string]: number };
    statusDistribution: { [key: string]: number };
    monthlyTrend: { [key: string]: number };
    avgDaysPerRequest: number;
    totalDaysTaken: number;
}

export default function LeaveAnalyticsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, typesRes] = await Promise.all([
                leavesService.getTeamRequests(),
                leavesService.listTypes(),
            ]);
            setRequests(reqRes);
            setLeaveTypes(typesRes);
            calculateAnalytics(reqRes);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch analytics data");
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (requestsList: LeaveRequest[]) => {
        const data: AnalyticsData = {
            totalRequests: requestsList.length,
            approvedCount: requestsList.filter(r => r.status === 'approved').length,
            rejectedCount: requestsList.filter(r => r.status === 'rejected').length,
            pendingCount: requestsList.filter(r => r.status === 'pending').length,
            cancelledCount: requestsList.filter(r => r.status === 'cancelled').length,
            leaveTypeDistribution: {},
            departmentDistribution: {},
            statusDistribution: {},
            monthlyTrend: {},
            avgDaysPerRequest: 0,
            totalDaysTaken: 0,
        };

        let totalDays = 0;

        // Calculate distributions
        requestsList.forEach(req => {
            // Leave type distribution
            const typeId = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as any)._id : req.leaveTypeId;
            const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as any).name : `Type ${typeId}`;
            data.leaveTypeDistribution[typeName] = (data.leaveTypeDistribution[typeName] || 0) + 1;

            // Department distribution
            const deptName = typeof req.employeeId === 'object' && (req.employeeId as any).primaryDepartmentId
                ? (typeof (req.employeeId as any).primaryDepartmentId === 'object'
                    ? (req.employeeId as any).primaryDepartmentId.name
                    : `Dept ${(req.employeeId as any).primaryDepartmentId}`)
                : 'Unknown';
            data.departmentDistribution[deptName] = (data.departmentDistribution[deptName] || 0) + 1;

            // Status distribution
            data.statusDistribution[req.status || 'unknown'] = (data.statusDistribution[req.status || 'unknown'] || 0) + 1;

            // Monthly trend
            const month = format(new Date(req.dates.from), 'MMM yyyy');
            data.monthlyTrend[month] = (data.monthlyTrend[month] || 0) + 1;

            // Days calculation
            const days = req.totalDays || 0;
            totalDays += days;
        });

        data.totalDaysTaken = totalDays;
        data.avgDaysPerRequest = requestsList.length > 0 ? Math.round((totalDays / requestsList.length) * 10) / 10 : 0;

        setAnalytics(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    if (!analytics) {
        return (
            <AppShell title="Leave Pattern Analysis" subtitle="View leave request patterns and trends">
                <div className="text-center py-8">Loading analytics...</div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Leave Pattern Analysis" subtitle="View leave request patterns and trends">
            <div className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{analytics.approvedCount}</div>
                            <p className="text-xs text-gray-500">
                                {analytics.totalRequests > 0 ? Math.round((analytics.approvedCount / analytics.totalRequests) * 100) : 0}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{analytics.pendingCount}</div>
                            <p className="text-xs text-gray-500">
                                {analytics.totalRequests > 0 ? Math.round((analytics.pendingCount / analytics.totalRequests) * 100) : 0}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{analytics.rejectedCount}</div>
                            <p className="text-xs text-gray-500">
                                {analytics.totalRequests > 0 ? Math.round((analytics.rejectedCount / analytics.totalRequests) * 100) : 0}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalDaysTaken}</div>
                            <p className="text-xs text-gray-500">Avg: {analytics.avgDaysPerRequest} days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Leave Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Type Distribution</CardTitle>
                        <CardDescription>Number of requests by leave type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(analytics.leaveTypeDistribution).length > 0 ? (
                                Object.entries(analytics.leaveTypeDistribution)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">{type}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(count / analytics.totalRequests) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="ml-4 font-bold">{count}</span>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-500">No data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Breakdown</CardTitle>
                        <CardDescription>Distribution of request statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(analytics.statusDistribution)
                                .sort(([, a], [, b]) => b - a)
                                .map(([status, count]) => (
                                    <Badge key={status} className={`${getStatusColor(status)} px-4 py-2 text-base`}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}: {count} ({Math.round((count / analytics.totalRequests) * 100)}%)
                                    </Badge>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Department Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department Distribution</CardTitle>
                        <CardDescription>Leave requests by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(analytics.departmentDistribution).length > 0 ? (
                                Object.entries(analytics.departmentDistribution)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([dept, count]) => (
                                        <div key={dept} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">{dept}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(count / analytics.totalRequests) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="ml-4 font-bold">{count}</span>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-500">No data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trend</CardTitle>
                        <CardDescription>Leave requests over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(analytics.monthlyTrend).length > 0 ? (
                                Object.entries(analytics.monthlyTrend)
                                    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                                    .map(([month, count]) => {
                                        const maxCount = Math.max(...Object.values(analytics.monthlyTrend));
                                        return (
                                            <div key={month} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium">{month}</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${(count / maxCount) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="ml-4 font-bold">{count}</span>
                                            </div>
                                        );
                                    })
                            ) : (
                                <p className="text-gray-500">No data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle>Key Insights</CardTitle>
                        <CardDescription>Pattern analysis summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="font-medium">Most Used Leave Type:</span> {' '}
                                {Object.entries(analytics.leaveTypeDistribution).length > 0
                                    ? Object.entries(analytics.leaveTypeDistribution).sort(([, a], [, b]) => b - a)[0][0]
                                    : 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Highest Activity Department:</span> {' '}
                                {Object.entries(analytics.departmentDistribution).length > 0
                                    ? Object.entries(analytics.departmentDistribution).sort(([, a], [, b]) => b - a)[0][0]
                                    : 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Approval Rate:</span> {' '}
                                {analytics.totalRequests > 0
                                    ? `${Math.round((analytics.approvedCount / analytics.totalRequests) * 100)}%`
                                    : 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Average Days per Request:</span> {' '}
                                {analytics.avgDaysPerRequest} days
                            </p>
                            <p>
                                <span className="font-medium">Pending Resolution:</span> {' '}
                                {analytics.totalRequests > 0
                                    ? `${Math.round((analytics.pendingCount / analytics.totalRequests) * 100)}% (${analytics.pendingCount} requests)`
                                    : 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
