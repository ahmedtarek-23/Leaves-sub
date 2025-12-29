"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function ApiCheckPage() {
    const [results, setResults] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const checkBackend = async () => {
        setLoading(true);
        const testResults: any = {};

        try {
            console.log("🔍 Checking backend health...");
            
            // 1. Check basic connectivity
            try {
                const response = await fetch("http://localhost:5000/");
                testResults.basicConnectivity = {
                    status: response.ok ? "✅ OK" : "❌ FAILED",
                    code: response.status,
                    message: `HTTP ${response.status}`,
                };
            } catch (e: any) {
                testResults.basicConnectivity = {
                    status: "❌ FAILED",
                    error: e.message,
                };
            }

            // 2. Check API base URL
            testResults.apiBaseURL = {
                value: api.defaults.baseURL,
                status: "ℹ️ CONFIG",
            };

            // 3. Check token in localStorage
            const token = localStorage.getItem("access_token");
            testResults.token = {
                status: token ? "✅ FOUND" : "❌ NOT FOUND",
                length: token ? token.length : 0,
            };

            // 4. Test GET /leaves/types
            try {
                console.log("Testing GET /leaves/types...");
                const res = await api.get("/leaves/types");
                testResults.leaveTypes = {
                    status: "✅ SUCCESS",
                    count: res.data?.length || 0,
                    data: res.data,
                };
            } catch (e: any) {
                testResults.leaveTypes = {
                    status: "❌ FAILED",
                    code: e.response?.status,
                    message: e.response?.data?.message || e.message,
                    url: e.config?.url,
                    baseURL: e.config?.baseURL,
                };
            }

            // 5. Test POST /leaves/types (will fail without proper data, but shows if route exists)
            try {
                console.log("Testing POST /leaves/types...");
                const res = await api.post("/leaves/types", {
                    code: "TEST",
                    name: "Test Leave",
                });
                testResults.createLeaveType = {
                    status: "✅ SUCCESS",
                    data: res.data,
                };
            } catch (e: any) {
                testResults.createLeaveType = {
                    status: e.response?.status === 400 ? "⚠️ ROUTE EXISTS (validation error)" : "❌ FAILED",
                    code: e.response?.status,
                    message: e.response?.data?.message || e.message,
                    url: e.config?.url,
                };
            }

            // 6. Test GET /employee-profile
            try {
                console.log("Testing GET /employee-profile...");
                const res = await api.get("/employee-profile");
                testResults.employeeProfile = {
                    status: "✅ SUCCESS",
                    count: res.data?.length || 0,
                };
            } catch (e: any) {
                testResults.employeeProfile = {
                    status: "❌ FAILED",
                    code: e.response?.status,
                    message: e.response?.data?.message || e.message,
                    url: e.config?.url,
                };
            }

            setResults(testResults);
        } catch (e) {
            console.error("Error during health check:", e);
            setResults({ error: String(e) });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkBackend();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>API Health Check</CardTitle>
                        <CardDescription>Diagnostic information to help troubleshoot API issues</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4">
                            <Button onClick={checkBackend} disabled={loading}>
                                {loading ? "Checking..." : "Run Health Check"}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(results).map(([key, value]: [string, any]) => (
                                <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white">
                                    <h3 className="font-semibold mb-2 text-lg">{key}</h3>
                                    <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
                                        {JSON.stringify(value, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Troubleshooting Guide</h3>
                            <ul className="text-sm space-y-2">
                                <li>
                                    <strong>❌ basicConnectivity FAILED:</strong> Backend server is not running. Start it with <code>npm run start:dev</code> in the backend directory.
                                </li>
                                <li>
                                    <strong>❌ leaveTypes FAILED (404):</strong> The /leaves/types route does not exist. Verify the backend compiled correctly.
                                </li>
                                <li>
                                    <strong>❌ token NOT FOUND:</strong> You need to log in first to get an authentication token.
                                </li>
                                <li>
                                    <strong>⚠️ ROUTE EXISTS (validation error):</strong> The endpoint exists but requires valid data. This is expected.
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
