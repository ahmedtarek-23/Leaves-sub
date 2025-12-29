"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
import { LeaveEntitlement, LeaveRequest, LeaveType } from "@/types/leaves";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function LeavesManagerPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [balances, setBalances] = useState<LeaveEntitlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

    // Approval Dialog
    const [selectedReq, setSelectedReq] = useState<string | null>(null);
    const [actionReason, setActionReason] = useState("");
    const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);

    // Bulk actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkActionType, setBulkActionType] = useState<"APPROVE" | "REJECT" | null>(null);
    const [bulkActionReason, setBulkActionReason] = useState("");
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterLeaveType, setFilterLeaveType] = useState<string>("all");
    const [filterFromDate, setFilterFromDate] = useState<string>("");
    const [filterToDate, setFilterToDate] = useState<string>("");
    const [sortBy, setSortBy] = useState<'date' | 'status' | 'employee' | 'type'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, balRes, typesRes] = await Promise.all([
                leavesService.getTeamRequests(),
                leavesService.getTeamBalances(),
                leavesService.listTypes(),
            ]);
            setRequests(reqRes);
            setBalances(balRes);
            setLeaveTypes(typesRes);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch team data");
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredData = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (filterStatus && filterStatus !== "all") filters.status = filterStatus;
            if (filterLeaveType && filterLeaveType !== "all") filters.leaveTypeId = filterLeaveType;
            if (filterFromDate) filters.from = filterFromDate;
            if (filterToDate) filters.to = filterToDate;
            filters.sortBy = sortBy;
            filters.sortOrder = sortOrder;

            console.log("📊 Applying filters:", filters);
            const reqRes = await leavesService.getTeamRequestsFiltered(filters);
            setRequests(reqRes);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch filtered requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async () => {
        if (!selectedReq || !actionType) return;
        try {
            // Use new two-level approval workflow
            const action = actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED';
            await leavesService.managerApprove(selectedReq, action as 'APPROVED' | 'REJECTED', actionReason);
            toast.success(`✅ Request ${action.toLowerCase()} - Pending HR review`);
            setSelectedReq(null);
            setActionType(null);
            setActionReason("");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    const handleBulkAction = async () => {
        if (selectedIds.size === 0 || !bulkActionType) return;
        console.log("🔄 Starting bulk action:", bulkActionType, "for", selectedIds.size, "requests");
        try {
            setIsBulkLoading(true);
            if (bulkActionType === "APPROVE") {
                console.log("📤 Calling bulkApprove with IDs:", Array.from(selectedIds));
                await leavesService.bulkApprove(Array.from(selectedIds));
                toast.success(`${selectedIds.size} requests approved`);
            } else {
                console.log("📤 Calling bulkReject with IDs:", Array.from(selectedIds), "Reason:", bulkActionReason);
                await leavesService.bulkReject(Array.from(selectedIds), bulkActionReason);
                toast.success(`${selectedIds.size} requests rejected`);
            }
            setSelectedIds(new Set());
            setBulkActionType(null);
            setBulkActionReason("");
            fetchData();
        } catch (error) {
            console.error("❌ Bulk action error:", error);
            toast.error("Bulk action failed");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const toggleSelectId = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        console.log("✅ Toggle select ID:", id, "New selected count:", newSelected.size);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === pendingRequests.length) {
            setSelectedIds(new Set());
            console.log("❌ Deselected all requests");
        } else {
            setSelectedIds(new Set(pendingRequests.map(r => r._id)));
            console.log("✅ Selected all", pendingRequests.length, "requests");
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const historyRequests = requests.filter(r => r.status !== 'pending');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved": return <Badge className="bg-green-500">Approved</Badge>;
            case "rejected": return <Badge variant="destructive">Rejected</Badge>;
            case "pending": return <Badge variant="secondary">Pending</Badge>;
            case "cancelled": return <Badge variant="outline">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppShell title="Manager Dashboard" subtitle="Manage team leaves">
            <Tabs defaultValue="requests">
                <TabsList>
                    <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
                    <TabsTrigger value="balances">Team Balances</TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="space-y-4">
                    {/* Filter Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filter & Sort</CardTitle>
                            <CardDescription>Refine leave requests by criteria</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

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
                                    <label className="block text-sm font-medium mb-2">From Date</label>
                                    <Input
                                        type="date"
                                        value={filterFromDate}
                                        onChange={(e) => setFilterFromDate(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">To Date</label>
                                    <Input
                                        type="date"
                                        value={filterToDate}
                                        onChange={(e) => setFilterToDate(e.target.value)}
                                    />
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
                                            <SelectItem value="employee">Employee</SelectItem>
                                            <SelectItem value="type">Type</SelectItem>
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

                                <div className="flex items-end gap-2">
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                        onClick={fetchFilteredData}
                                        disabled={loading}
                                    >
                                        Apply Filters
                                    </Button>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setFilterStatus("all");
                                            setFilterLeaveType("all");
                                            setFilterFromDate("");
                                            setFilterToDate("");
                                            setSortBy("date");
                                            setSortOrder("desc");
                                            fetchData();
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Requests Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Pending Requests</CardTitle>
                                    <CardDescription>Requests awaiting your approval. ({pendingRequests.length})</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {/* Quick Action Buttons */}
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        onClick={async () => {
                                            if (pendingRequests.length === 0) {
                                                toast.info("No pending requests to approve");
                                                return;
                                            }
                                            console.log("⚡ Quick Approve All Pending:", pendingRequests.length);
                                            try {
                                                setIsBulkLoading(true);
                                                const allIds = pendingRequests.map(r => r._id);
                                                await leavesService.bulkApprove(allIds);
                                                toast.success(`✅ All ${pendingRequests.length} pending requests approved!`);
                                                fetchData();
                                            } catch (error) {
                                                console.error("Error:", error);
                                                toast.error("Failed to approve all requests");
                                            } finally {
                                                setIsBulkLoading(false);
                                            }
                                        }}
                                        disabled={pendingRequests.length === 0 || isBulkLoading}
                                    >
                                        ✓ Approve All Pending
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                                        onClick={() => {
                                            if (pendingRequests.length === 0) {
                                                toast.info("No pending requests to reject");
                                                return;
                                            }
                                            console.log("⚡ Quick Reject All Pending:", pendingRequests.length);
                                            setBulkActionType("REJECT");
                                            setSelectedIds(new Set(pendingRequests.map(r => r._id)));
                                        }}
                                        disabled={pendingRequests.length === 0 || isBulkLoading}
                                    >
                                        ✕ Reject All Pending
                                    </Button>

                                    {/* Selection-based Buttons */}
                                    {selectedIds.size > 0 && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => {
                                                    console.log("✅ Approve selected:", selectedIds.size);
                                                    setBulkActionType("APPROVE");
                                                }}
                                                disabled={isBulkLoading}
                                            >
                                                Approve ({selectedIds.size})
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                onClick={() => {
                                                    console.log("❌ Reject selected:", selectedIds.size);
                                                    setBulkActionType("REJECT");
                                                }}
                                                disabled={isBulkLoading}
                                            >
                                                Reject ({selectedIds.size})
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <input
                                                type="checkbox"
                                                checked={pendingRequests.length > 0 && selectedIds.size === pendingRequests.length}
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                                disabled={pendingRequests.length === 0}
                                            />
                                        </TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Justification</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24">No pending requests.</TableCell>
                                        </TableRow>
                                    )}
                                    {pendingRequests.map((req) => {
                                        const empName = typeof req.employeeId === 'object' ? `${(req.employeeId as any).firstName} ${(req.employeeId as any).lastName}` : 'Employee';
                                        const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as LeaveType).name : 'Leave';

                                        return (
                                            <TableRow key={req._id}>
                                                <TableCell className="w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(req._id)}
                                                        onChange={() => toggleSelectId(req._id)}
                                                        className="rounded"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{empName}</TableCell>
                                                <TableCell>{typeName}</TableCell>
                                                <TableCell>
                                                    {format(new Date(req.dates.from), "MMM d")} - {format(new Date(req.dates.to), "MMM d")}
                                                </TableCell>
                                                <TableCell>{req.durationDays}</TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={req.justification}>{req.justification || '-'}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-green-500 text-green-600 hover:bg-green-50"
                                                        onClick={() => { setSelectedReq(req._id); setActionType("APPROVE"); }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                                        onClick={() => { setSelectedReq(req._id); setActionType("REJECT"); }}
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Request History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyRequests.map((req) => {
                                        const empName = typeof req.employeeId === 'object' ? `${(req.employeeId as any).firstName} ${(req.employeeId as any).lastName}` : 'Employee';
                                        const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as LeaveType).name : 'Leave';
                                        return (
                                            <TableRow key={req._id}>
                                                <TableCell>{empName}</TableCell>
                                                <TableCell>{typeName}</TableCell>
                                                <TableCell>
                                                    {format(new Date(req.dates.from), "MMM d")} - {format(new Date(req.dates.to), "MMM d")}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(req.status)}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="balances">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Balances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Entitlement</TableHead>
                                        <TableHead>Taken</TableHead>
                                        <TableHead>Pending</TableHead>
                                        <TableHead className="font-bold">Remaining</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {balances.map((ent) => {
                                        const empName = typeof ent.employeeId === 'object' ? `${(ent.employeeId as any).firstName} ${(ent.employeeId as any).lastName}` : 'Employee';
                                        const typeName = typeof ent.leaveTypeId === 'object' ? (ent.leaveTypeId as LeaveType).name : 'Leave';
                                        return (
                                            <TableRow key={ent._id}>
                                                <TableCell className="font-medium">{empName}</TableCell>
                                                <TableCell>{typeName}</TableCell>
                                                <TableCell>{ent.yearlyEntitlement}</TableCell>
                                                <TableCell>{ent.taken}</TableCell>
                                                <TableCell>{ent.pending}</TableCell>
                                                <TableCell className="font-bold text-green-600">{ent.remaining}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === 'APPROVE' ? '✓ Approve' : '✕ Reject'} Request</DialogTitle>
                        <DialogDescription>
                            {actionType === 'APPROVE' 
                                ? 'Your approval will send this request to HR for final review.'
                                : 'Your rejection will be final unless HR admin overrides it.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason/Comment (optional)</label>
                        <Textarea
                            placeholder="Reason/Comment..."
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReq(null)}>Cancel</Button>
                        <Button onClick={handleAction} className={actionType === 'APPROVE' ? 'bg-green-600' : 'bg-red-600'}>
                            {actionType === 'APPROVE' ? 'Approve & Send to HR' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!bulkActionType} onOpenChange={(open) => !open && setBulkActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{bulkActionType === 'APPROVE' ? 'Approve' : 'Reject'} {selectedIds.size} Requests</DialogTitle>
                        <DialogDescription>
                            {bulkActionType === 'APPROVE' 
                                ? `You are about to approve ${selectedIds.size} leave request(s).`
                                : `You are about to reject ${selectedIds.size} leave request(s).`}
                        </DialogDescription>
                    </DialogHeader>
                    {bulkActionType === 'REJECT' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason for rejection (optional)</label>
                            <Textarea
                                placeholder="Reason/Comment..."
                                value={bulkActionReason}
                                onChange={(e) => setBulkActionReason(e.target.value)}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkActionType(null)} disabled={isBulkLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkAction} disabled={isBulkLoading}>
                            {isBulkLoading ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
