"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { AppShell } from "@/components/layout/app-shell";
import { NewRequestDialog } from "@/components/leaves/new-request-dialog";
import { leavesService } from "@/services/leaves.service";
import { LeaveEntitlement, LeaveRequest, LeaveType } from "@/types/leaves";

export default function LeavesDashboardPage() {
    const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [balRes, reqRes] = await Promise.all([
                leavesService.getMyBalance(),
                leavesService.getMyRequests(),
            ]);
            setEntitlements(balRes);
            setRequests(reqRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                                {requests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {requests.map((req) => {
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
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
