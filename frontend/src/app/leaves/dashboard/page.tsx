"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AppShell } from "@/components/layout/app-shell";
import { NewRequestDialog } from "@/components/leaves/new-request-dialog";
import { EditRequestDialog } from "@/components/leaves/edit-request-dialog";
import { leavesService } from "@/services/leaves.service";
import { LeaveEntitlement, LeaveRequest, LeaveType } from "@/types/leaves";

export default function LeavesDashboardPage() {
    const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Filter states
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterLeaveType, setFilterLeaveType] = useState<string>("all");
    const [filterFromDate, setFilterFromDate] = useState<string>("");
    const [filterToDate, setFilterToDate] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [balRes, reqRes, typesRes] = await Promise.all([
                leavesService.getMyBalance(),
                leavesService.getMyRequests(),
                leavesService.listTypes(),
            ]);
            setEntitlements(balRes);
            setRequests(reqRes);
            setLeaveTypes(typesRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter and sort requests
    const filteredRequests = requests
        .filter((req) => {
            // Status filter
            if (filterStatus !== "all" && req.status !== filterStatus) {
                return false;
            }

            // Leave type filter
            if (filterLeaveType !== "all") {
                const typeId = typeof req.leaveTypeId === "object" ? req.leaveTypeId._id : req.leaveTypeId;
                if (typeId !== filterLeaveType) {
                    return false;
                }
            }

            // Date range filter
            const reqFromDate = parseISO(req.dates.from as unknown as string);
            const reqToDate = parseISO(req.dates.to as unknown as string);

            if (filterFromDate) {
                const filterFrom = parseISO(filterFromDate);
                if (reqToDate < filterFrom) {
                    return false;
                }
            }

            if (filterToDate) {
                const filterTo = parseISO(filterToDate);
                if (reqFromDate > filterTo) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.dates.from).getTime();
            const dateB = new Date(b.dates.from).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

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
        <AppShell title="My Leaves" subtitle="Manage your time off and view balances">
            <div className="space-y-8">
                {/* Actions */}
                <div className="flex justify-end">
                    <NewRequestDialog onCheckChange={fetchData} />
                </div>

                {/* Balances */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {entitlements.map((ent) => {
                        // ent.leaveTypeId might be populated object or string. 
                        // Ideally backend populates it. I'll assume it might be populated 
                        // or I should have fetched types to map names.
                        // Based on typical NestJS populating, it's often an object if populated.
                        // But my interface says `string | LeaveType`.
                        const typeName = typeof ent.leaveTypeId === 'object' ? (ent.leaveTypeId as LeaveType).name : 'Leave Type';

                        return (
                            <Card key={ent._id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {typeName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{ent.remaining} days</div>
                                    <p className="text-xs text-muted-foreground">
                                        {ent.taken} taken, {ent.pending} pending
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Requests</CardTitle>
                        <CardDescription>A list of your recent leave requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filter Section */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Status</label>
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

                                    {/* Leave Type Filter */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Leave Type</label>
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

                                    {/* From Date Filter */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">From Date</label>
                                        <Input
                                            type="date"
                                            value={filterFromDate}
                                            onChange={(e) => setFilterFromDate(e.target.value)}
                                            placeholder="From date"
                                        />
                                    </div>

                                    {/* To Date Filter */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">To Date</label>
                                        <Input
                                            type="date"
                                            value={filterToDate}
                                            onChange={(e) => setFilterToDate(e.target.value)}
                                            placeholder="To date"
                                        />
                                    </div>

                                    {/* Sort Order */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Sort Order</label>
                                        <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sort order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Newest First</SelectItem>
                                                <SelectItem value="asc">Oldest First</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Reset Button */}
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setFilterStatus("all");
                                            setFilterLeaveType("all");
                                            setFilterFromDate("");
                                            setFilterToDate("");
                                            setSortOrder("desc");
                                        }}
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredRequests.map((req) => {
                                    const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as LeaveType).name : 'Unknown';
                                    return (
                                        <TableRow key={req._id}>
                                            <TableCell className="font-medium">{typeName}</TableCell>
                                            <TableCell>
                                                {format(new Date(req.dates.from), "MMM d, yyyy")} -{" "}
                                                {format(new Date(req.dates.to), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>{req.totalDays} days</TableCell>
                                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                                            <TableCell className="text-right">
                                                {req.status === "pending" && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-500 hover:text-blue-700"
                                                            onClick={() => {
                                                                setEditingRequest(req);
                                                                setEditDialogOpen(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={async () => {
                                                                if (confirm('Are you sure you want to cancel this request?')) {
                                                                    await leavesService.cancelRequest(req._id);
                                                                    fetchData();
                                                                }
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Edit Request Dialog */}
                {editingRequest && (
                    <EditRequestDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        request={editingRequest}
                        leaveTypes={leaveTypes}
                        onSuccess={fetchData}
                    />
                )}
            </div>
        </AppShell>
    );
}
