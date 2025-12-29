"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leavesService } from "@/services/leaves.service";
import { LeaveType, LeaveRequest } from "@/types/leaves";
import { format, parseISO } from "date-fns";

interface EditRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: LeaveRequest;
    leaveTypes: LeaveType[];
    onSuccess?: () => void;
}

export function EditRequestDialog({
    open,
    onOpenChange,
    request,
    leaveTypes,
    onSuccess,
}: EditRequestDialogProps) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: {
            leaveTypeId: typeof request.leaveTypeId === 'object' ? request.leaveTypeId._id : request.leaveTypeId,
            from: format(parseISO(request.dates.from as unknown as string), "yyyy-MM-dd"),
            to: format(parseISO(request.dates.to as unknown as string), "yyyy-MM-dd"),
            justification: request.justification || "",
        },
        mode: "onChange",
    });

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const fromDate = new Date(data.from);
            const toDate = new Date(data.to);

            if (fromDate > toDate) {
                toast.error("From date must be before or equal to To date");
                return;
            }

            await leavesService.updateRequest(request._id, {
                leaveTypeId: data.leaveTypeId,
                dates: {
                    from: fromDate.toISOString(),
                    to: toDate.toISOString(),
                },
                justification: data.justification,
            });

            toast.success("Leave request updated successfully");
            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update leave request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Leave Request</DialogTitle>
                    <DialogDescription>
                        Modify your leave request details. You can only edit requests that are still pending.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Leave Type</label>
                        <Controller
                            name="leaveTypeId"
                            control={control}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From Date</label>
                            <Input
                                type="date"
                                {...register("from", { required: "From date is required" })}
                            />
                            {errors.from && (
                                <p className="text-sm text-red-500">{String(errors.from.message)}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To Date</label>
                            <Input
                                type="date"
                                {...register("to", { required: "To date is required" })}
                            />
                            {errors.to && (
                                <p className="text-sm text-red-500">{String(errors.to.message)}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Justification</label>
                        <Textarea
                            placeholder="Add any comments or justification..."
                            {...register("justification")}
                            className="min-h-[80px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
