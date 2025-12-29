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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leavesService } from "@/services/leaves.service";
import { LeaveType } from "@/types/leaves";

export function NewRequestDialog({ onCheckChange }: { onCheckChange?: () => void }) {
    const [open, setOpen] = useState(false);
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: {
            leaveTypeId: "",
            from: "",
            to: "",
            justification: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (open) {
            leavesService.listTypes().then(setTypes).catch(console.error);
        }
    }, [open]);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const fromDate = new Date(data.from);
            const toDate = new Date(data.to);
            await leavesService.submitRequest({
                leaveTypeId: data.leaveTypeId,
                dates: {
                    from: fromDate.toISOString(),
                    to: toDate.toISOString(),
                },
                justification: data.justification,
            });
            toast.success("Leave request submitted successfully");
            setOpen(false);
            reset();
            if (onCheckChange) onCheckChange();
        } catch (error: any) {
            toast.error("Failed to submit request");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>New Request</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>
                        Submit a new leave request.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Leave Type</label>
                        <Controller
                            name="leaveTypeId"
                            control={control}
                            rules={{ required: "Leave type is required" }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent className="z-50">
                                        {types.length > 0 ? (
                                            types.map((t) => (
                                                <SelectItem key={t._id} value={t._id}>
                                                    {t.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-gray-500">No leave types available</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.leaveTypeId && <span className="text-red-500 text-sm">{errors.leaveTypeId.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From</label>
                            <Input type="date" {...register("from", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To</label>
                            <Input type="date" {...register("to", { required: true })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Justification</label>
                        <Textarea {...register("justification")} placeholder="Reason for leave..." />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
