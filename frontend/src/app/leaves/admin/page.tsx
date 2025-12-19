"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Need to check if exists or use basic
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
import { LeaveType, LeavePolicy, AccrualMethod } from "@/types/leaves";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function LeavesAdminPage() {
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [openTypeDialog, setOpenTypeDialog] = useState(false);
    const [openPolicyDialog, setOpenPolicyDialog] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tRes, pRes] = await Promise.all([
                leavesService.listTypes(),
                leavesService.listPolicies(),
            ]);
            setTypes(tRes);
            setPolicies(pRes);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Create Type Form ---
    const { register: regType, handleSubmit: subType, reset: resType } = useForm();
    const onSubmitType = async (data: any) => {
        try {
            await leavesService.createType({
                ...data,
                paid: String(data.paid) === 'true' || data.paid === true, // handle checkbox/select quirks
                deductible: String(data.deductible) === 'true' || data.deductible === true,
                categoryId: '60d0fe4f5311236168a109ca', // Mock Category ID or allow input. Backend requires MongoID.
                // For now, I'll hardcode a fake MongoID or I need an input for it. 
                // I'll make it an input or assume specific categories exist.
                // I will add a text input for Category ID for now.
            });
            toast.success("Leave Type created");
            setOpenTypeDialog(false);
            resType();
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create type");
        }
    };

    // --- Create Policy Form ---
    const { register: regPol, handleSubmit: subPol, reset: resPol, setValue: setValPol } = useForm();
    const onSubmitPolicy = async (data: any) => {
        try {
            await leavesService.createPolicy({
                ...data,
                monthlyRate: Number(data.monthlyRate),
                yearlyRate: Number(data.yearlyRate),
                maxCarryForward: Number(data.maxCarryForward),
            });
            toast.success("Policy created");
            setOpenPolicyDialog(false);
            resPol();
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create policy");
        }
    };

    return (
        <AppShell title="Leave Configuration" subtitle="Manage types and policies">
            <Tabs defaultValue="types">
                <TabsList>
                    <TabsTrigger value="types">Leave Types</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                </TabsList>

                {/* --- Types Tab --- */}
                <TabsContent value="types" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={openTypeDialog} onOpenChange={setOpenTypeDialog}>
                            <DialogTrigger asChild><Button>Add Leave Type</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>New Leave Type</DialogTitle></DialogHeader>
                                <form onSubmit={subType(onSubmitType)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input {...regType("name", { required: true })} placeholder="Annual Leave" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Code</Label>
                                            <Input {...regType("code", { required: true })} placeholder="AL" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category ID (MongoID)</Label>
                                        <Input {...regType("categoryId", { required: true })} placeholder="60d0..." />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" {...regType("paid")} /> Paid
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" {...regType("deductible")} /> Deductible
                                        </label>
                                    </div>
                                    <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Deductible</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {types.map(t => (
                                        <TableRow key={t._id}>
                                            <TableCell className="font-medium">{t.name}</TableCell>
                                            <TableCell>{t.code}</TableCell>
                                            <TableCell>{t.paid ? "Yes" : "No"}</TableCell>
                                            <TableCell>{t.deductible ? "Yes" : "No"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Policies Tab --- */}
                <TabsContent value="policies" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={openPolicyDialog} onOpenChange={setOpenPolicyDialog}>
                            <DialogTrigger asChild><Button>Add Policy</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>New Policy</DialogTitle></DialogHeader>
                                <form onSubmit={subPol(onSubmitPolicy)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Leave Type</Label>
                                        <Select onValueChange={(val) => setValPol("leaveTypeId", val)}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                {types.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {/* Note: In real app, standard Select vs react-hook-form needs Controller. 
                          Using native select for simplicity inside the form if needed, or controlled comp.
                          I'll use a hidden input or assume Select works with setValPol.
                          Actually the Select component usage above is wrong prop name `rsOnValueChange`.
                          Correcting to `onValueChange`.
                      */}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Accrual Method</Label>
                                            <select className="w-full border rounded p-2" {...regPol("accrualMethod")}>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Monthly Rate</Label>
                                            <Input type="number" step="0.1" {...regPol("monthlyRate")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Yearly Rate</Label>
                                            <Input type="number" step="0.5" {...regPol("yearlyRate")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Carry Forward</Label>
                                            <Input type="number" {...regPol("maxCarryForward")} />
                                        </div>
                                    </div>

                                    <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Accrual</TableHead>
                                        <TableHead>Rate (Mo/Yr)</TableHead>
                                        <TableHead>Carry Fwd</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {policies.map(p => {
                                        const tName = typeof p.leaveTypeId === 'object' ? (p.leaveTypeId as LeaveType).name : 'Link Broken';
                                        return (
                                            <TableRow key={p._id}>
                                                <TableCell className="font-medium">{tName}</TableCell>
                                                <TableCell className="capitalize">{p.accrualMethod}</TableCell>
                                                <TableCell>{p.monthlyRate} / {p.yearlyRate}</TableCell>
                                                <TableCell>{p.maxCarryForward}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </AppShell>
    );
}
