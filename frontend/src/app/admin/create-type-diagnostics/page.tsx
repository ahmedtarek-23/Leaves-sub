"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function CreateTypeDiagnosticsPage() {
    const [diagnostics, setDiagnostics] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const results: any = {};

        try {
            // 1. Check token
            const token = localStorage.getItem("access_token");
            results.authentication = {
                tokenExists: !!token,
                tokenLength: token?.length || 0,
                status: token ? "✅ FOUND" : "❌ NOT FOUND",
            };

            // 2. Check API configuration
            results.apiConfig = {
                baseURL: api.defaults.baseURL,
                headers: api.defaults.headers,
                status: "ℹ️ INFO",
            };

            // 3. Test backend connectivity
            try {
                const pingRes = await fetch("http://localhost:5000/");
                results.backendConnectivity = {
                    status: pingRes.ok ? "✅ REACHABLE" : "❌ UNREACHABLE",
                    code: pingRes.status,
                };
            } catch (e: any) {
                results.backendConnectivity = {
                    status: "❌ UNREACHABLE",
                    error: e.message,
                };
            }

            // 4. Test GET /leaves/types (should work for all authenticated users)
            try {
                console.log("Testing GET /leaves/types...");
                const res = await api.get("/leaves/types");
                results.getLeaveTypes = {
                    status: "✅ SUCCESS",
                    count: res.data?.length || 0,
                    sample: res.data?.slice(0, 1),
                };
            } catch (e: any) {
                results.getLeaveTypes = {
                    status: "❌ FAILED",
                    code: e.response?.status,
                    message: e.response?.data?.message || e.message,
                };
            }

            // 5. Test POST /leaves/types with minimal valid data
            try {
                console.log("Testing POST /leaves/types...");
                
                // First, we need to know if there's a valid categoryId
                // For now, just try with a test categoryId
                const testData = {
                    code: "TEST",
                    name: "Test Leave Type",
                    categoryId: "000000000000000000000000", // Will likely fail, but shows route exists
                    description: "Test",
                    paid: true,
                    deductible: true,
                };
                
                const res = await api.post("/leaves/types", testData);
                results.postLeaveTypes = {
                    status: "✅ SUCCESS",
                    data: res.data,
                };
            } catch (e: any) {
                const code = e.response?.status;
                results.postLeaveTypes = {
                    status: 
                        code === 404 ? "❌ ROUTE NOT FOUND (404)" :
                        code === 400 ? "⚠️ BAD REQUEST (400) - Route exists but invalid data" :
                        code === 403 ? "❌ FORBIDDEN (403) - Missing MANAGE_LEAVES permission" :
                        code === 401 ? "❌ UNAUTHORIZED (401) - Invalid token" :
                        code === 500 ? "❌ SERVER ERROR (500)" :
                        "❌ FAILED",
                    code: code,
                    message: e.response?.data?.message || e.message,
                    url: e.config?.url,
                    baseURL: e.config?.baseURL,
                    headers: e.config?.headers,
                };
            }

            setDiagnostics(results);
        } catch (e) {
            console.error("Diagnostic error:", e);
            setDiagnostics({ error: String(e) });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    const getIssueDescription = () => {
        const { authentication, backendConnectivity, postLeaveTypes } = diagnostics;

        if (!authentication?.tokenExists) {
            return {
                title: "❌ Not Authenticated",
                description: "You need to log in first to get an authentication token",
                solution: "Go to /login and log in with your credentials",
            };
        }

        if (backendConnectivity?.status?.includes("UNREACHABLE")) {
            return {
                title: "❌ Backend Not Running",
                description: "Cannot connect to backend on port 5000",
                solution: "Start the backend: npm run start:dev in the backend directory",
            };
        }

        const postStatus = postLeaveTypes?.status;

        if (postStatus?.includes("404")) {
            return {
                title: "❌ Route Not Found",
                description: "POST /leaves/types endpoint does not exist on backend",
                solution: "Restart backend - it may not have compiled the latest changes",
            };
        }

        if (postStatus?.includes("403")) {
            return {
                title: "❌ Permission Denied",
                description: "User doesn't have MANAGE_LEAVES permission",
                solution: "Make sure you're logged in as HR Admin with MANAGE_LEAVES permission",
            };
        }

        if (postStatus?.includes("400")) {
            return {
                title: "✅ Route Exists!",
                description: "POST /leaves/types endpoint exists and accepts requests",
                solution: "Use a valid categoryId. The 400 error is just from our test data.",
            };
        }

        if (postStatus?.includes("500")) {
            return {
                title: "❌ Server Error",
                description: "Backend returned 500 error",
                solution: "Check backend console for error details",
            };
        }

        return null;
    };

    const issue = getIssueDescription();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Leave Type - Diagnostics</CardTitle>
                        <CardDescription>
                            Troubleshoot "Create type error: {"{}"}" issues
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4">
                            <Button onClick={runDiagnostics} disabled={loading}>
                                {loading ? "Running..." : "Run Diagnostics"}
                            </Button>
                        </div>

                        {/* Issue Summary */}
                        {issue && (
                            <div className={`border-l-4 p-4 rounded ${
                                issue.title.includes("✅") 
                                    ? "bg-green-50 border-green-400" 
                                    : "bg-red-50 border-red-400"
                            }`}>
                                <h3 className="font-semibold mb-2">{issue.title}</h3>
                                <p className="text-sm mb-3">{issue.description}</p>
                                <div className="bg-white p-3 rounded border text-sm font-mono">
                                    {issue.solution}
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        <div className="space-y-4">
                            {Object.entries(diagnostics).map(([key, value]: [string, any]) => {
                                const getBadgeVariant = (): any => {
                                    if (value.status?.includes("✅")) return "secondary";
                                    if (value.status?.includes("❌")) return "destructive";
                                    if (value.status?.includes("⚠️")) return "outline";
                                    return "default";
                                };
                                return (
                                    <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            {key}
                                            {value.status && (
                                                <Badge variant={getBadgeVariant()}>
                                                    {value.status}
                                                </Badge>
                                            )}
                                        </h3>
                                        <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
                                            {JSON.stringify(value, null, 2)}
                                        </pre>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Troubleshooting Steps */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-base">Troubleshooting Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold mb-1">Step 1: Check Backend</p>
                                    <code className="bg-white p-2 block rounded border text-xs">
                                        cd backend && npm run start:dev
                                    </code>
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Step 2: Verify Authentication</p>
                                    <p>Log in at /login and come back to run diagnostics</p>
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Step 3: Check Browser Console</p>
                                    <p>Open DevTools (F12), go to Console tab, and look for emoji-marked logs:</p>
                                    <ul className="list-disc list-inside mt-1 ml-2">
                                        <li>🚀 = Request sent</li>
                                        <li>✅ = Success</li>
                                        <li>❌ = Error</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Step 4: Check Network Tab</p>
                                    <p>In DevTools Network tab, look for the POST request to /leaves/types and check:</p>
                                    <ul className="list-disc list-inside mt-1 ml-2">
                                        <li>Status code (should be 201 or 400, not 404)</li>
                                        <li>Request URL (should be http://localhost:5000/leaves/types)</li>
                                        <li>Authorization header (should have Bearer token)</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Common Error Codes */}
                        <Card className="bg-amber-50 border-amber-200">
                            <CardHeader>
                                <CardTitle className="text-base">HTTP Status Code Reference</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border-l-2 border-red-400 pl-3">
                                        <p className="font-semibold">404 Not Found</p>
                                        <p className="text-xs text-gray-600">Backend route doesn't exist</p>
                                    </div>
                                    <div className="border-l-2 border-red-400 pl-3">
                                        <p className="font-semibold">401 Unauthorized</p>
                                        <p className="text-xs text-gray-600">Invalid or missing token</p>
                                    </div>
                                    <div className="border-l-2 border-red-400 pl-3">
                                        <p className="font-semibold">403 Forbidden</p>
                                        <p className="text-xs text-gray-600">Missing permission</p>
                                    </div>
                                    <div className="border-l-2 border-yellow-400 pl-3">
                                        <p className="font-semibold">400 Bad Request</p>
                                        <p className="text-xs text-gray-600">Route exists, invalid data</p>
                                    </div>
                                    <div className="border-l-2 border-red-400 pl-3">
                                        <p className="font-semibold">500 Server Error</p>
                                        <p className="text-xs text-gray-600">Backend error</p>
                                    </div>
                                    <div className="border-l-2 border-green-400 pl-3">
                                        <p className="font-semibold">201 Created</p>
                                        <p className="text-xs text-gray-600">Success!</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
