"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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

export default function LeavesManagerPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [balances, setBalances] = useState<LeaveEntitlement[]>([]);
    const [loading, setLoading] = useState(true);

    // Approval Dialog
    const [selectedReq, setSelectedReq] = useState<string | null>(null);
    const [actionReason, setActionReason] = useState("");
    const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, balRes] = await Promise.all([
                leavesService.getTeamRequests(),
                leavesService.getTeamBalances(),
            ]);
            setRequests(reqRes);
            setBalances(balRes);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch team data");
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
            await leavesService.managerAction(selectedReq, actionType, actionReason);
            toast.success(`Request ${actionType.toLowerCase()}ed`);
            setSelectedReq(null);
            setActionType(null);
            setActionReason("");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Requests</CardTitle>
                            <CardDescription>Requests awaiting your approval.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
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
                                            <TableCell colSpan={6} className="text-center h-24">No pending requests.</TableCell>
                                        </TableRow>
                                    )}
                                    {pendingRequests.map((req) => {
                                        const empName = typeof req.employeeId === 'object' ? `${(req.employeeId as any).firstName} ${(req.employeeId as any).lastName}` : 'Employee';
                                        const typeName = typeof req.leaveTypeId === 'object' ? (req.leaveTypeId as LeaveType).name : 'Leave';

                                        return (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium">{empName}</TableCell>
                                                <TableCell>{typeName}</TableCell>
                                                <TableCell>
                                                    {format(new Date(req.dates.from), "MMM d")} - {format(new Date(req.dates.to), "MMM d")}
                                                </TableCell>
                                                <TableCell>{req.totalDays}</TableCell>
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
                        <DialogTitle>{actionType === 'APPROVE' ? 'Approve' : 'Reject'} Request</DialogTitle>
                        <DialogDescription>
                            Add an optional reason for your decision.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Reason/Comment..."
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReq(null)}>Cancel</Button>
                        <Button onClick={handleAction}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
