"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
import { employeeService } from "@/services/employee.service";
import { LeaveType, LeaveEntitlement, AdjustmentType } from "@/types/leaves";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EmployeeOption {
    _id: string;
    firstName: string;
    lastName: string;
}

export default function AdjustBalancePage() {
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
    const [adjustmentAmount, setAdjustmentAmount] = useState<string>("");
    const [adjustmentReason, setAdjustmentReason] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching data for adjust balance page...");
            const [typesRes, empRes] = await Promise.all([
                leavesService.listTypes(),
                employeeService.listAll(),
            ]);
            console.log("✅ Data fetched successfully");
            setLeaveTypes(typesRes);
            setEmployees(empRes || []);
        } catch (error: any) {
            console.error("❌ Failed to fetch data:", error);
            toast.error(error.response?.data?.message || "Failed to fetch data - check console for details");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeEntitlements = async (employeeId: string) => {
        try {
            const ents = await leavesService.getEntitlement(employeeId);
            setEntitlements(ents);
        } catch (error: any) {
            console.error("❌ Failed to fetch entitlements:", error);
            toast.error(error.response?.data?.message || "Failed to fetch employee entitlements");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeEntitlements(selectedEmployee);
        } else {
            setEntitlements([]);
        }
    }, [selectedEmployee]);

    const handleSubmit = async () => {
        if (!selectedEmployee || !selectedLeaveType || !adjustmentAmount || !adjustmentReason) {
            toast.error("Please fill in all fields");
            return;
        }

        const amount = parseFloat(adjustmentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Adjustment amount must be a positive number");
            return;
        }

        setShowConfirmDialog(true);
    };

    const confirmAdjustment = async () => {
        try {
            setIsSubmitting(true);

            const data = {
                leaveTypeId: selectedLeaveType,
                adjustmentType: adjustmentType === "add" ? AdjustmentType.ADD : AdjustmentType.DEDUCT,
                amount: Math.abs(parseFloat(adjustmentAmount)),
                reason: adjustmentReason,
            };

            await leavesService.adjustBalance(selectedEmployee, data);
            toast.success(`✅ Balance adjusted successfully!`);

            // Reset form
            setSelectedEmployee("");
            setSelectedLeaveType("");
            setAdjustmentAmount("");
            setAdjustmentReason("");
            setAdjustmentType("add");
            setShowConfirmDialog(false);

            // Refresh data
            await fetchEmployeeEntitlements(selectedEmployee);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to adjust balance");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCurrentEntitlement = () => {
        if (!selectedLeaveType) return null;
        return entitlements.find(e => 
            (typeof e.leaveTypeId === 'object' ? (e.leaveTypeId as any)._id : e.leaveTypeId) === selectedLeaveType
        );
    };

    const currentEnt = getCurrentEntitlement();

    return (
        <AppShell title="Adjust Leave Balance" subtitle="Manually adjust employee leave entitlements">
            <div className="space-y-6">
                {/* Adjustment Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Adjust Employee Balance</CardTitle>
                        <CardDescription>Add or subtract leave days for an employee</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Employee Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Select Employee</label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an employee..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp._id} value={emp._id}>
                                                {emp.firstName} {emp.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Leave Type Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Select Leave Type</label>
                                <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a leave type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map((type) => (
                                            <SelectItem key={type._id} value={type._id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Current Balance Display */}
                            {currentEnt && (
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="pt-4">
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Entitlement</p>
                                                <p className="text-lg font-bold">{currentEnt.yearlyEntitlement}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Taken</p>
                                                <p className="text-lg font-bold text-red-600">{currentEnt.taken}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Pending</p>
                                                <p className="text-lg font-bold text-yellow-600">{currentEnt.pending}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Remaining</p>
                                                <p className="text-lg font-bold text-green-600">{currentEnt.remaining}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Adjustment Type Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Adjustment Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="add"
                                            checked={adjustmentType === "add"}
                                            onChange={(e) => setAdjustmentType(e.target.value as "add" | "subtract")}
                                            className="rounded"
                                        />
                                        <span className="text-green-600 font-medium">Add Days (+)</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="subtract"
                                            checked={adjustmentType === "subtract"}
                                            onChange={(e) => setAdjustmentType(e.target.value as "add" | "subtract")}
                                            className="rounded"
                                        />
                                        <span className="text-red-600 font-medium">Subtract Days (-)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Adjustment Amount */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Number of Days</label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 2.5"
                                    value={adjustmentAmount}
                                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                                    min="0"
                                    step="0.5"
                                />
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Reason for Adjustment</label>
                                <Textarea
                                    placeholder="e.g., Sick leave compensation, Policy correction, etc."
                                    value={adjustmentReason}
                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                onClick={handleSubmit}
                                disabled={!selectedEmployee || !selectedLeaveType || !adjustmentAmount || !adjustmentReason || isSubmitting}
                            >
                                {isSubmitting ? "Processing..." : "Review & Adjust Balance"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Employee Entitlements */}
                {selectedEmployee && entitlements.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Leave Entitlements</CardTitle>
                            <CardDescription>Current leave balance breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead className="text-right">Entitlement</TableHead>
                                        <TableHead className="text-right">Taken</TableHead>
                                        <TableHead className="text-right">Pending</TableHead>
                                        <TableHead className="text-right">Remaining</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entitlements.map((ent) => {
                                        const typeName = typeof ent.leaveTypeId === 'object'
                                            ? (ent.leaveTypeId as any).name
                                            : 'Leave';
                                        return (
                                            <TableRow key={ent._id}>
                                                <TableCell className="font-medium">{typeName}</TableCell>
                                                <TableCell className="text-right">{ent.yearlyEntitlement}</TableCell>
                                                <TableCell className="text-right text-red-600 font-semibold">{ent.taken}</TableCell>
                                                <TableCell className="text-right text-yellow-600 font-semibold">{ent.pending}</TableCell>
                                                <TableCell className="text-right text-green-600 font-bold">{ent.remaining}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Balance Adjustment</DialogTitle>
                        <DialogDescription>
                            Please review the adjustment details before proceeding.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Employee:</span>
                            <span className="font-medium">
                                {employees.find(e => e._id === selectedEmployee)?.firstName} {employees.find(e => e._id === selectedEmployee)?.lastName}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Leave Type:</span>
                            <span className="font-medium">
                                {leaveTypes.find(t => t._id === selectedLeaveType)?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Adjustment:</span>
                            <Badge className={adjustmentType === "add" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {adjustmentType === "add" ? "+" : "-"}{adjustmentAmount} days
                            </Badge>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600">Reason:</span>
                            <span className="font-medium max-w-xs text-right">{adjustmentReason}</span>
                        </div>
                        {currentEnt && (
                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600 mb-2">New Balance:</p>
                                <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-sm">
                                        Current Remaining: <span className="font-bold text-green-600">{currentEnt.remaining}</span>
                                        {" → "}
                                        <span className="font-bold text-blue-600">
                                            {adjustmentType === "add"
                                                ? (currentEnt.remaining + parseFloat(adjustmentAmount))
                                                : (currentEnt.remaining - parseFloat(adjustmentAmount))
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={confirmAdjustment}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Adjusting..." : "Confirm Adjustment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
