"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
import { LeaveType } from "@/types/leaves";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function AdminLeaveManagementPage() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);
    const [openCreateType, setOpenCreateType] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);
    const [openEditType, setOpenEditType] = useState(false);

    const { register: registerType, handleSubmit: handleTypeSubmit, reset: resetType, formState: { errors: typeErrors } } = useForm({
        defaultValues: {
            code: "",
            name: "",
            categoryId: "",
            description: "",
            paid: true,
            deductible: true,
            requiresAttachment: false,
            minTenureMonths: 0,
            maxDurationDays: 30,
        },
    });

    const { register: registerEditType, handleSubmit: handleEditTypeSubmit, reset: resetEditType, formState: { errors: editTypeErrors } } = useForm({
        defaultValues: {
            code: "",
            name: "",
            categoryId: "",
            description: "",
            paid: true,
            deductible: true,
            requiresAttachment: false,
            minTenureMonths: 0,
            maxDurationDays: 30,
        },
    });

    const fetchLeaveTypes = async () => {
        try {
            setLoading(true);
            console.log("🔍 Fetching leave types from backend...");
            console.log("📍 Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");
            const types = await leavesService.listTypes();
            console.log("✅ Leave types fetched successfully:", types);
            setLeaveTypes(types);
        } catch (error: any) {
            console.error("❌ Error fetching leave types:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                message: error.message,
                responseData: error.response?.data,
                fullError: error,
            });
            const errorMsg = error.response?.data?.message || error.message || "Failed to load leave types";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const onSubmitLeaveType = async (data: any) => {
        try {
            setLoading(true);
            console.log("🚀 Creating leave type with data:", data);
            await leavesService.createType({
                code: data.code,
                name: data.name,
                categoryId: data.categoryId,
                description: data.description,
                paid: data.paid,
                deductible: data.deductible,
                requiresAttachment: data.requiresAttachment,
                minTenureMonths: parseInt(data.minTenureMonths),
                maxDurationDays: parseInt(data.maxDurationDays),
            });
            console.log("✅ Leave type created successfully");
            toast.success("Leave type created successfully");
            resetType();
            setOpenCreateType(false);
            fetchLeaveTypes();
        } catch (error: any) {
            console.error("❌ Create type error details:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
                fullError: error,
            });
            toast.error(error?.response?.data?.message || "Failed to create leave type. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitEditLeaveType = async (data: any) => {
        try {
            setLoading(true);
            if (!editingType) return;
            console.log("🔄 Updating leave type:", editingType._id, data);
            await leavesService.updateType(editingType._id, {
                code: data.code,
                name: data.name,
                categoryId: data.categoryId,
                description: data.description,
                paid: data.paid,
                deductible: data.deductible,
                requiresAttachment: data.requiresAttachment,
                minTenureMonths: parseInt(data.minTenureMonths),
                maxDurationDays: parseInt(data.maxDurationDays),
            });
            console.log("✅ Leave type updated successfully");
            toast.success("Leave type updated successfully");
            resetEditType();
            setOpenEditType(false);
            setEditingType(null);
            fetchLeaveTypes();
        } catch (error: any) {
            console.error("❌ Update type error details:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
                fullError: error,
            });
            toast.error(error?.response?.data?.message || "Failed to update leave type. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (type: LeaveType) => {
        setEditingType(type);
        resetEditType({
            code: type.code,
            name: type.name,
            categoryId: type.categoryId,
            description: type.description || "",
            paid: type.paid,
            deductible: type.deductible,
            requiresAttachment: type.requiresAttachment || false,
            minTenureMonths: type.minTenureMonths || 0,
            maxDurationDays: type.maxDurationDays || 30,
        });
        setOpenEditType(true);
    };

    return (
        <AppShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                    <p className="text-gray-600 mt-2">Manage leave types and entitlements for your organization.</p>
                </div>

                {/* Leave Types Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Leave Types</CardTitle>
                            <CardDescription>Create and manage leave types available in your organization.</CardDescription>
                        </div>
                        <Dialog open={openCreateType} onOpenChange={setOpenCreateType}>
                            <DialogTrigger asChild>
                                <Button>Create Leave Type</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Leave Type</DialogTitle>
                                    <DialogDescription>
                                        Add a new leave type to your organization.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleTypeSubmit(onSubmitLeaveType)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Code</label>
                                        <Input
                                            placeholder="e.g., AL, SL"
                                            {...registerType("code", { required: "Code is required" })}
                                        />
                                        {typeErrors.code && (
                                            <p className="text-sm text-red-500">{String(typeErrors.code.message)}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Leave Type Name</label>
                                        <Input
                                            placeholder="e.g., Annual Leave, Sick Leave"
                                            {...registerType("name", { required: "Name is required" })}
                                        />
                                        {typeErrors.name && (
                                            <p className="text-sm text-red-500">{String(typeErrors.name.message)}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category ID</label>
                                        <Input
                                            placeholder="Enter category ID"
                                            {...registerType("categoryId", { required: "Category ID is required" })}
                                        />
                                        {typeErrors.categoryId && (
                                            <p className="text-sm text-red-500">{String(typeErrors.categoryId.message)}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            placeholder="Describe this leave type..."
                                            {...registerType("description")}
                                            className="min-h-[80px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Paid Leave</label>
                                            <select
                                                {...registerType("paid")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Deductible</label>
                                            <select
                                                {...registerType("deductible")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Min Tenure (months)</label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...registerType("minTenureMonths")}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Max Duration (days)</label>
                                            <Input
                                                type="number"
                                                placeholder="30"
                                                {...registerType("maxDurationDays")}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpenCreateType(false)}
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
                        {leaveTypes.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No leave types created yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Deductible</TableHead>
                                        <TableHead>Max Duration</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveTypes.map((type) => (
                                        <TableRow key={type._id}>
                                            <TableCell className="font-medium">{type.code}</TableCell>
                                            <TableCell>{type.name}</TableCell>
                                            <TableCell className="max-w-xs truncate">{type.description || "-"}</TableCell>
                                            <TableCell>{type.paid ? "Yes" : "No"}</TableCell>
                                            <TableCell>{type.deductible ? "Yes" : "No"}</TableCell>
                                            <TableCell>{type.maxDurationDays || "-"} days</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-500 hover:text-blue-700"
                                                    onClick={() => handleEditClick(type)}
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

                {/* Edit Leave Type Dialog */}
                <Dialog open={openEditType} onOpenChange={setOpenEditType}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Leave Type</DialogTitle>
                            <DialogDescription>
                                Update the leave type details.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditTypeSubmit(onSubmitEditLeaveType)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Code</label>
                                <Input
                                    placeholder="e.g., AL, SL"
                                    {...registerEditType("code", { required: "Code is required" })}
                                />
                                {editTypeErrors.code && (
                                    <p className="text-sm text-red-500">{String(editTypeErrors.code.message)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Leave Type Name</label>
                                <Input
                                    placeholder="e.g., Annual Leave, Sick Leave"
                                    {...registerEditType("name", { required: "Name is required" })}
                                />
                                {editTypeErrors.name && (
                                    <p className="text-sm text-red-500">{String(editTypeErrors.name.message)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category ID</label>
                                <Input
                                    placeholder="Enter category ID"
                                    {...registerEditType("categoryId", { required: "Category ID is required" })}
                                />
                                {editTypeErrors.categoryId && (
                                    <p className="text-sm text-red-500">{String(editTypeErrors.categoryId.message)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Describe this leave type..."
                                    {...registerEditType("description")}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Paid Leave</label>
                                    <select
                                        {...registerEditType("paid")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Deductible</label>
                                    <select
                                        {...registerEditType("deductible")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Min Tenure (months)</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...registerEditType("minTenureMonths")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Max Duration (days)</label>
                                    <Input
                                        type="number"
                                        placeholder="30"
                                        {...registerEditType("maxDurationDays")}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpenEditType(false);
                                        setEditingType(null);
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
