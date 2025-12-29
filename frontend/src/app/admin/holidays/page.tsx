"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { leavesService } from "@/services/leaves.service";
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
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

interface Holiday {
    date: string;
    name?: string;
}

interface Calendar {
    year: number;
    holidays: string[];
    blockedPeriods: Array<{
        from: string;
        to: string;
        reason: string;
    }>;
}

export default function HolidayCalendarPage() {
    const [calendar, setCalendar] = useState<Calendar | null>(null);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [openAddHoliday, setOpenAddHoliday] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            holidayDate: "",
            holidayName: "",
        },
    });

    const fetchCalendar = async () => {
        try {
            setLoading(true);
            console.log("🔍 Fetching calendar for year:", year);
            const cal = await leavesService.getCalendar(year);
            setCalendar(cal);
            
            // Convert to holiday format for display
            const holidayList: Holiday[] = (cal.holidays || []).map((date: string) => ({
                date,
                name: "Holiday",
            }));
            setHolidays(holidayList);
        } catch (error: any) {
            console.error("❌ Error fetching calendar:", {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data,
            });
            toast.error("Failed to load holiday calendar");
            // Set empty calendar if not found
            setCalendar({ year, holidays: [], blockedPeriods: [] });
            setHolidays([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendar();
    }, [year]);

    const onAddHoliday = async (data: any) => {
        try {
            setLoading(true);
            const holidayDate = new Date(data.holidayDate).toISOString().split('T')[0];
            
            // Add to local list
            const newHoliday: Holiday = {
                date: holidayDate,
                name: data.holidayName || "Holiday",
            };
            
            const updatedHolidays = [...holidays, newHoliday].sort((a, b) => a.date.localeCompare(b.date));
            const holidayDates = updatedHolidays.map(h => h.date);
            
            console.log("🚀 Adding holiday:", newHoliday);
            
            // Save to backend
            await leavesService.createCalendar(year, holidayDates, calendar?.blockedPeriods || []);
            
            console.log("✅ Holiday added successfully");
            setHolidays(updatedHolidays);
            toast.success("Holiday added successfully");
            reset();
            setOpenAddHoliday(false);
        } catch (error: any) {
            console.error("❌ Error adding holiday:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                fullError: error,
            });
            toast.error(error?.response?.data?.message || "Failed to add holiday");
        } finally {
            setLoading(false);
        }
    };

    const removeHoliday = async (dateToRemove: string) => {
        try {
            setLoading(true);
            const updatedHolidays = holidays.filter(h => h.date !== dateToRemove);
            const holidayDates = updatedHolidays.map(h => h.date);
            
            console.log("🗑️ Removing holiday:", dateToRemove);
            
            await leavesService.createCalendar(year, holidayDates, calendar?.blockedPeriods || []);
            
            console.log("✅ Holiday removed successfully");
            setHolidays(updatedHolidays);
            toast.success("Holiday removed successfully");
        } catch (error: any) {
            console.error("❌ Error removing holiday:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
                url: error.config?.url,
                fullError: error,
            });
            toast.error(error?.response?.data?.message || "Failed to remove holiday");
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (dateStr: string) => {
        return format(parseISO(dateStr), "MMMM");
    };

    const getDayName = (dateStr: string) => {
        return format(parseISO(dateStr), "EEEE");
    };

    // Group holidays by month
    const holidaysByMonth = holidays.reduce((acc, holiday) => {
        const month = getMonthName(holiday.date);
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(holiday);
        return acc;
    }, {} as Record<string, Holiday[]>);

    return (
        <AppShell
            title="Holiday Calendar"
            subtitle="Manage public holidays and non-working days"
            allowedRoles={["HR Admin", "System Admin"]}
        >
            <div className="space-y-6">
                {/* Year Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Year</CardTitle>
                        <CardDescription>Choose the year to manage holidays for</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4 items-end">
                        <div className="flex-1 max-w-md">
                            <label className="text-sm font-medium">Year</label>
                            <Input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                min={2000}
                                max={2100}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Holidays Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Holidays for {year}</CardTitle>
                            <CardDescription>
                                {holidays.length} holiday{holidays.length !== 1 ? "s" : ""} configured
                            </CardDescription>
                        </div>
                        <Dialog open={openAddHoliday} onOpenChange={setOpenAddHoliday}>
                            <DialogTrigger asChild>
                                <Button>Add Holiday</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Holiday</DialogTitle>
                                    <DialogDescription>
                                        Add a public holiday for {year}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit(onAddHoliday)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Holiday Date *</label>
                                        <Input
                                            type="date"
                                            {...register("holidayDate", { required: "Date is required" })}
                                        />
                                        {errors.holidayDate && (
                                            <p className="text-sm text-red-500">{String(errors.holidayDate.message)}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Holiday Name (optional)</label>
                                        <Input
                                            placeholder="e.g., New Year's Day, Christmas"
                                            {...register("holidayName")}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpenAddHoliday(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? "Adding..." : "Add Holiday"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {loading && !calendar ? (
                            <p className="text-center text-gray-500">Loading calendar...</p>
                        ) : holidays.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No holidays configured for {year}</p>
                                <Button onClick={() => setOpenAddHoliday(true)}>Add First Holiday</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(holidaysByMonth).map(([month, monthHolidays]) => (
                                    <div key={month}>
                                        <h3 className="font-semibold text-lg mb-3">{month}</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Day</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {monthHolidays.map((holiday) => (
                                                    <TableRow key={holiday.date}>
                                                        <TableCell className="font-medium">
                                                            {format(parseISO(holiday.date), "MMM d, yyyy")}
                                                        </TableCell>
                                                        <TableCell>{getDayName(holiday.date)}</TableCell>
                                                        <TableCell>{holiday.name || "Holiday"}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => removeHoliday(holiday.date)}
                                                                disabled={loading}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Calendar Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span>Year:</span>
                            <Badge variant="outline">{year}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Holidays:</span>
                            <Badge variant="secondary">{holidays.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span>Working Days Affected:</span>
                            <Badge variant="secondary">{holidays.length}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
