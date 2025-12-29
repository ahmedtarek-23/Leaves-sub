"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
import { LeaveRequest, LeaveType } from "@/types/leaves";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function HrApprovalsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

    // Approval Dialog
    const [selectedReq, setSelectedReq] = useState<string | null>(null);
    const [actionReason, setActionReason] = useState("");
    const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterLeaveType, setFilterLeaveType] = useState<string>("all");
    const [filterManagerStatus, setFilterManagerStatus] = useState<string>("all");
    const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, typesRes] = await Promise.all([
                leavesService.getTeamRequests(),
                leavesService.listTypes(),
            ]);
            setRequests(reqRes || []);
            setLeaveTypes(typesRes || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch leave requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproval = async () => {
        if (!selectedReq || !actionType) return;
        try {
            setIsSubmitting(true);
            await leavesService.hrApprove(selectedReq, actionType, actionReason);
            toast.success(`✅ Request ${actionType.toLowerCase()}!`);
            setSelectedReq(null);
            setActionType(null);
            setActionReason("");
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getManagerStatus = (req: any) => {
        if (req.managerApprovalStatus === 'APPROVED') return <Badge className="bg-green-500">Manager Approved</Badge>;
        if (req.managerApprovalStatus === 'REJECTED') return <Badge variant="destructive">Manager Rejected</Badge>;
        return <Badge variant="secondary">Manager Pending</Badge>;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved": return <Badge className="bg-green-500">✓ Approved</Badge>;
            case "rejected": return <Badge variant="destructive">✕ Rejected</Badge>;
            case "pending": return <Badge variant="secondary">Pending</Badge>;
            case "cancelled": return <Badge variant="outline">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Filter and organize requests
    const pendingApproval = requests.filter(r => {
        const managerApproved = r.managerApprovalStatus === 'APPROVED' || r.managerApprovalStatus === 'REJECTED';
        const hrPending = r.hrApprovalStatus === 'PENDING';
        if (!managerApproved || !hrPending) return false;
        if (filterStatus !== "all" && r.status !== filterStatus) return false;
        if (filterLeaveType !== "all" && (typeof r.leaveTypeId === 'object' ? r.leaveTypeId._id : r.leaveTypeId) !== filterLeaveType) return false;
        if (filterManagerStatus !== "all" && r.managerApprovalStatus !== filterManagerStatus) return false;
        return true;
    });

    const approvedByHr = requests.filter(r => r.hrApprovalStatus === 'APPROVED' && r.status === 'approved');
    const rejectedByHr = requests.filter(r => r.hrApprovalStatus === 'REJECTED' && r.status === 'rejected');

    return (
        <AppShell title="HR Leave Approvals" subtitle="Review and approve leave requests - Final approval stage">
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">Pending HR Review ({pendingApproval.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedByHr.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedByHr.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {/* Filter Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filter & Sort</CardTitle>
                            <CardDescription>Refine leave requests awaiting your approval</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Leave Type</label>
                                    <Select value={filterLeaveType} onValueChange={setFilterLeaveType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            {leaveTypes.map((type) => (
                                                <SelectItem key={type._id} value={type._id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Manager Status</label>
                                    <Select value={filterManagerStatus} onValueChange={setFilterManagerStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="APPROVED">Manager Approved</SelectItem>
                                            <SelectItem value="REJECTED">Manager Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Sort By</label>
                                    <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date">Date</SelectItem>
                                            <SelectItem value="status">Status</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Order</label>
                                    <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">Ascending</SelectItem>
                                            <SelectItem value="desc">Descending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setFilterLeaveType("all");
                                            setFilterManagerStatus("all");
                                            setSortBy("date");
                                            setSortOrder("desc");
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Requests for HR Approval */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requests Awaiting Your Approval</CardTitle>
                            <CardDescription>
                                These requests have been reviewed by managers. You can approve or reject them.
                                Your decision overrides the manager's decision.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Manager Decision</TableHead>
                                        <TableHead>Justification</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApproval.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24">
                                                No requests pending your approval.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {pendingApproval.map((req) => {
                                        const empName = typeof req.employeeId === 'object' ? `${(req.employeeId as any).firstName} ${(req.employeeId as any).lastName}` : 'Employee';
                                        const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as LeaveType).name : 'Leave';

                                        return (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium">{empName}</TableCell>
                                                <TableCell>{typeName}</TableCell>
                                                <TableCell>
                                                    {format(new Date(req.dates.from), "MMM d")} - {format(new Date(req.dates.to), "MMM d")}
                                                </TableCell>
                                                <TableCell>{req.durationDays}</TableCell>
                                                <TableCell>{getManagerStatus(req)}</TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={req.justification}>{req.justification || '-'}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-green-500 text-green-600 hover:bg-green-50"
                                                        onClick={() => { setSelectedReq(req._id); setActionType("APPROVED"); }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                                        onClick={() => { setSelectedReq(req._id); setActionType("REJECTED"); }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approved Requests</CardTitle>
                            <CardDescription>Requests approved by you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Manager Decision</TableHead>
                                        <TableHead>Approved At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {approvedByHr.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">No approved requests.</TableCell>
                                        </TableRow>
                                    )}
                                    {approvedByHr.map((req) => {
                                        const empName = typeof req.employeeId === 'object' ? `${(req.employeeId as any).firstName} ${(req.employeeId as any).lastName}` : 'Employee';
                                        const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as LeaveType).name : 'Leave';
                                        return (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium">{empName}</TableCell>
                                                <TableCell>{typeName}</TableCell>
                                                <TableCell>
                                                    {format(new Date(req.dates.from), "MMM d")} - {format(new Date(req.dates.to), "MMM d")}
                                                </TableCell>
                                                <TableCell>{getManagerStatus(req)}</TableCell>
                                                <TableCell>
                                                    {req.hrApprovedAt ? format(new Date(req.hrApprovedAt), "MMM d, yyyy") : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Requests</CardTitle>
                            <CardDescription>Requests rejected by you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Rejection Reason</TableHead>
                                        <TableHead>Rejected At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rejectedByHr.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">No rejected requests.</TableCell>
                                        </TableRow>
                                    )}
                                    {rejectedByHr.map((req) => {
                                        const empName = typeof req.employeeId === 'object' ? `${(req.employeeId as any).firstName} ${(req.employeeId as any).lastName}` : 'Employee';
                                        const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as LeaveType).name : 'Leave';
                                        return (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium">{empName}</TableCell>
                                                <TableCell>{typeName}</TableCell>
                                                <TableCell>
                                                    {format(new Date(req.dates.from), "MMM d")} - {format(new Date(req.dates.to), "MMM d")}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={req.hrRejectionReason}>{req.hrRejectionReason || '-'}</TableCell>
                                                <TableCell>
                                                    {req.hrApprovedAt ? format(new Date(req.hrApprovedAt), "MMM d, yyyy") : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Approval Dialog */}
            <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === 'APPROVED' ? '✓ Approve' : '✕ Reject'} Request</DialogTitle>
                        <DialogDescription>
                            {actionType === 'APPROVED' 
                                ? 'This will approve the leave request and deduct the days from the employee balance.'
                                : 'This will reject the leave request. Your decision overrides the manager.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason/Comment (optional)</label>
                        <Textarea
                            placeholder="Add reason for your decision..."
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReq(null)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleApproval} 
                            disabled={isSubmitting}
                            className={actionType === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'}
                        >
                            {isSubmitting ? 'Processing...' : (actionType === 'APPROVED' ? 'Approve' : 'Reject')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
