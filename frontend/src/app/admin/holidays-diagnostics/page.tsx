"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { leavesService } from "@/services/leaves.service";

export default function HolidayDiagnosticsPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [results, setResults] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const testHolidayCreation = async () => {
        setLoading(true);
        const testResults: any = {};

        try {
            // 1. Check connectivity
            try {
                const res = await fetch("http://localhost:5000/");
                testResults.backendConnectivity = {
                    status: res.ok ? "✅ REACHABLE" : "❌ UNREACHABLE",
                    code: res.status,
                };
            } catch (e: any) {
                testResults.backendConnectivity = {
                    status: "❌ UNREACHABLE",
                    error: e.message,
                };
            }

            // 2. Check token
            const token = localStorage.getItem("access_token");
            testResults.authentication = {
                tokenExists: !!token,
                status: token ? "✅ FOUND" : "❌ NOT FOUND",
            };

            // 3. Test GET calendar
            try {
                console.log("Testing GET /leaves/calendars/" + year);
                const calRes = await leavesService.getCalendar(year);
                testResults.getCalendar = {
                    status: "✅ SUCCESS",
                    data: calRes,
                };
            } catch (e: any) {
                testResults.getCalendar = {
                    status: "❌ FAILED",
                    code: e.response?.status,
                    message: e.response?.data?.message || e.message,
                };
            }

            // 4. Test POST calendar with test data
            try {
                console.log("Testing POST /leaves/calendars with test data");
                const testDate = new Date(year, 0, 1).toISOString().split('T')[0]; // Jan 1st
                
                const testData = {
                    year,
                    holidays: [testDate],
                    blockedPeriods: [],
                };
                
                console.log("Sending:", testData);
                
                const res = await api.post("/leaves/calendars", testData);
                testResults.postCalendar = {
                    status: "✅ SUCCESS",
                    data: res.data,
                };
            } catch (e: any) {
                testResults.postCalendar = {
                    status: 
                        e.response?.status === 404 ? "❌ ROUTE NOT FOUND (404)" :
                        e.response?.status === 400 ? "⚠️ BAD REQUEST (400)" :
                        e.response?.status === 403 ? "❌ FORBIDDEN (403)" :
                        "❌ FAILED",
                    code: e.response?.status,
                    message: e.response?.data?.message || e.message,
                    data: e.response?.data,
                };
            }

            // 5. Test the exact same data format as onAddHoliday uses
            try {
                console.log("Testing with same format as holidays page");
                const holidays = [new Date(year, 0, 1).toISOString().split('T')[0]];
                const blockedPeriods: any[] = [];
                
                console.log("Holiday dates:", holidays);
                console.log("Mapped to Date objects:", holidays.map(h => new Date(h)));
                
                await leavesService.createCalendar(year, holidays, blockedPeriods);
                
                testResults.createCalendarService = {
                    status: "✅ SUCCESS",
                    message: "Service method works",
                };
            } catch (e: any) {
                testResults.createCalendarService = {
                    status: "❌ FAILED",
                    code: e.response?.status,
                    message: e.response?.data?.message || e.message,
                    data: e.response?.data,
                };
            }

            setResults(testResults);
        } catch (e) {
            console.error("Test error:", e);
            setResults({ error: String(e) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Holiday Calendar Diagnostics</CardTitle>
                        <CardDescription>Debug holiday creation issues</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4">
                            <Input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                min={2000}
                                max={2100}
                                className="max-w-[200px]"
                                placeholder="Year"
                            />
                            <Button onClick={testHolidayCreation} disabled={loading}>
                                {loading ? "Testing..." : "Run Tests"}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(results).map(([key, value]: [string, any]) => (
                                <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white">
                                    <h3 className="font-semibold mb-2">{key}</h3>
                                    <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
                                        {JSON.stringify(value, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>

                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-base">Troubleshooting</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold">1. If POST /leaves/calendars returns 400 (Bad Request):</p>
                                    <p className="text-gray-600 mt-1">
                                        The endpoint exists but the data format is wrong. Check the backend logs for validation errors.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold">2. If POST /leaves/calendars returns 404:</p>
                                    <p className="text-gray-600 mt-1">
                                        Backend didn't recompile. Restart: npm run start:dev
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold">3. If POST /leaves/calendars returns 403:</p>
                                    <p className="text-gray-600 mt-1">
                                        Missing permission. Make sure you're logged in as HR Admin.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
