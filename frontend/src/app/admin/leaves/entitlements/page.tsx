"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
import { api } from "@/lib/api";
import { LeaveType } from "@/types/leaves";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface EmployeeOption {
    _id: string;
    name: string;
    employeeNumber?: string;
}

interface EntitlementWithEmployee {
    _id: string;
    employeeId: EmployeeOption;
    leaveTypeId: LeaveType;
    yearlyEntitlement?: number;
    accruedActual?: number;
    carryForward?: number;
    remaining?: number;
}

export default function AdminEntitlementsPage() {
    const [entitlements, setEntitlements] = useState<EntitlementWithEmployee[]>([]);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);
    const [openCreateEntitlement, setOpenCreateEntitlement] = useState(false);
    const [editingEntitlement, setEditingEntitlement] = useState<EntitlementWithEmployee | null>(null);
    const [openEditEntitlement, setOpenEditEntitlement] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: {
            employeeId: "",
            leaveTypeId: "",
            yearlyEntitlement: 20,
            accruedActual: 0,
            carryForward: 0,
        },
    });

    const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, control: controlEdit, formState: { errors: editErrors } } = useForm({
        defaultValues: {
            yearlyEntitlement: 20,
            accruedActual: 0,
            carryForward: 0,
        },
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [entRes, empRes, typRes] = await Promise.all([
                api.get("/leaves/entitlements"),
                api.get("/employee-profile"),
                leavesService.listTypes(),
            ]);
            setEntitlements(entRes.data);
            
            // Transform employee data to match our interface
            const transformedEmployees = empRes.data.map((emp: any) => ({
                _id: emp._id,
                name: `${emp.firstName} ${emp.lastName}`,
                employeeNumber: emp.employeeNumber,
            }));
            setEmployees(transformedEmployees);
            setLeaveTypes(typRes);
        } catch (error: any) {
            console.error("Error fetching data:", {
                status: error.response?.status,
                message: error.message,
                url: error.config?.url,
                data: error.response?.data,
            });
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            await leavesService.createEntitlement({
                employeeId: data.employeeId,
                leaveTypeId: data.leaveTypeId,
                yearlyEntitlement: parseFloat(data.yearlyEntitlement),
                accruedActual: parseFloat(data.accruedActual),
                carryForward: parseFloat(data.carryForward),
            });
            toast.success("Entitlement created successfully");
            reset();
            setOpenCreateEntitlement(false);
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create entitlement");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitEdit = async (data: any) => {
        try {
            setLoading(true);
            if (!editingEntitlement) return;
            await leavesService.updateEntitlement(editingEntitlement._id, {
                yearlyEntitlement: parseFloat(data.yearlyEntitlement),
                accruedActual: parseFloat(data.accruedActual),
                carryForward: parseFloat(data.carryForward),
            });
            toast.success("Entitlement updated successfully");
            resetEdit();
            setOpenEditEntitlement(false);
            setEditingEntitlement(null);
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update entitlement");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (ent: EntitlementWithEmployee) => {
        setEditingEntitlement(ent);
        resetEdit({
            yearlyEntitlement: ent.yearlyEntitlement || 20,
            accruedActual: ent.accruedActual || 0,
            carryForward: ent.carryForward || 0,
        });
        setOpenEditEntitlement(true);
    };

    return (
        <AppShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leave Entitlements</h1>
                    <p className="text-gray-600 mt-2">Manage leave entitlements for employees.</p>
                </div>

                {/* Entitlements Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Employee Entitlements</CardTitle>
                            <CardDescription>Create and manage leave entitlements for your employees.</CardDescription>
                        </div>
                        <Dialog open={openCreateEntitlement} onOpenChange={setOpenCreateEntitlement}>
                            <DialogTrigger asChild>
                                <Button>Create Entitlement</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Entitlement</DialogTitle>
                                    <DialogDescription>
                                        Assign a leave entitlement to an employee.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Employee</label>
                                        <Controller
                                            name="employeeId"
                                            control={control}
                                            rules={{ required: "Please select an employee" }}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select employee" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {employees.map((emp) => (
                                                            <SelectItem key={emp._id} value={emp._id}>
                                                                {emp.name} {emp.employeeNumber ? `(${emp.employeeNumber})` : ""}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.employeeId && (
                                            <p className="text-sm text-red-500">{String(errors.employeeId.message)}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Leave Type</label>
                                        <Controller
                                            name="leaveTypeId"
                                            control={control}
                                            rules={{ required: "Please select a leave type" }}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select leave type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {leaveTypes.map((type) => (
                                                            <SelectItem key={type._id} value={type._id}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.leaveTypeId && (
                                            <p className="text-sm text-red-500">{String(errors.leaveTypeId.message)}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Yearly Entitlement</label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                placeholder="20"
                                                {...register("yearlyEntitlement", { required: "Required" })}
                                            />
                                            {errors.yearlyEntitlement && (
                                                <p className="text-sm text-red-500">{String(errors.yearlyEntitlement.message)}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Accrued</label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                placeholder="0"
                                                {...register("accruedActual")}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Carry Forward</label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                placeholder="0"
                                                {...register("carryForward")}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpenCreateEntitlement(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? "Creating..." : "Create"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {entitlements.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No entitlements created yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Yearly Entitlement</TableHead>
                                        <TableHead>Accrued</TableHead>
                                        <TableHead>Carry Forward</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entitlements.map((ent) => (
                                        <TableRow key={ent._id}>
                                            <TableCell className="font-medium">
                                                {typeof ent.employeeId === 'object' ? ent.employeeId.name : 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                {typeof ent.leaveTypeId === 'object' ? ent.leaveTypeId.name : 'Unknown'}
                                            </TableCell>
                                            <TableCell>{ent.yearlyEntitlement || "-"}</TableCell>
                                            <TableCell>{ent.accruedActual || "0"}</TableCell>
                                            <TableCell>{ent.carryForward || "0"}</TableCell>
                                            <TableCell>{ent.remaining || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-500 hover:text-blue-700"
                                                    onClick={() => handleEditClick(ent)}
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Entitlement Dialog */}
                <Dialog open={openEditEntitlement} onOpenChange={setOpenEditEntitlement}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Entitlement</DialogTitle>
                            <DialogDescription>
                                Update the entitlement details for {editingEntitlement && typeof editingEntitlement.employeeId === 'object' ? editingEntitlement.employeeId.name : 'employee'}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit(onSubmitEdit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Yearly Entitlement</label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="20"
                                    {...registerEdit("yearlyEntitlement", { required: "Required" })}
                                />
                                {editErrors.yearlyEntitlement && (
                                    <p className="text-sm text-red-500">{String(editErrors.yearlyEntitlement.message)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Accrued</label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="0"
                                    {...registerEdit("accruedActual")}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Carry Forward</label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="0"
                                    {...registerEdit("carryForward")}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpenEditEntitlement(false);
                                        setEditingEntitlement(null);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Updating..." : "Update"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppShell>
    );
}
