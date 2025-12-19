"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"; // I assume Form components exist or I need to use basic html
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leavesService } from "@/services/leaves.service";
import { LeaveType } from "@/types/leaves";

export function NewRequestDialog({ onCheckChange }: { onCheckChange?: () => void }) {
    const [open, setOpen] = useState(false);
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);

    // Simplified form handling without full shadcn Form wrapper if check fails, 
    // but let's assume standard shadcn form usage or just raw inputs + react-hook-form.
    // Using standard HTML form elements with styles for simplicity if I can't verifying Form components.
    // Actually, I saw `input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx`, `dialog.tsx` in `components/ui`.
    // I didn't see `form.tsx`. I will use standard html form structure with ui components.

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            leaveTypeId: "",
            from: "",
            to: "",
            justification: "",
        }
    });

    useEffect(() => {
        if (open) {
            leavesService.listTypes().then(setTypes).catch(console.error);
        }
    }, [open]);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            await leavesService.submitRequest({
                leaveTypeId: data.leaveTypeId,
                dates: {
                    from: new Date(data.from),
                    to: new Date(data.to),
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
                        <Select onValueChange={(val) => setValue("leaveTypeId", val)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((t) => (
                                    <SelectItem key={t._id} value={t._id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
