"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import leavesService from "@/services/leaves.service";

interface LeaveType {
  _id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid?: boolean;
  deductible?: boolean;
  requiresAttachment?: boolean;
  attachmentType?: string;
  minTenureMonths?: number | null;
  maxDurationDays?: number | null;
}

interface Category {
  _id: string;
  name?: string;
  code?: string;
}

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    categoryId: "",
    description: "",
    paid: true,
    deductible: true,
    requiresAttachment: false,
    attachmentType: "",
    minTenureMonths: "",
    maxDurationDays: "",
  });

  // Fetch both leave types and categories
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🚀 Fetching leave types and categories");
      const [types, cats] = await Promise.all([
        leavesService.listTypes(),
        leavesService.listCategories(),
      ]);
      console.log("✅ Leave types fetched:", types);
      console.log("✅ Categories fetched:", cats);
      setLeaveTypes(types);
      setCategories(cats);
    } catch (error: any) {
      console.error("❌ Error fetching data:", error);
      toast.error("Failed to fetch leave types or categories");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      categoryId: "",
      description: "",
      paid: true,
      deductible: true,
      requiresAttachment: false,
      attachmentType: "",
      minTenureMonths: "",
      maxDurationDays: "",
    });
    setEditingId(null);
  };

  const openDialog = (type?: LeaveType) => {
    if (type) {
      setEditingId(type._id);
      setFormData({
        code: type.code,
        name: type.name,
        categoryId: type.categoryId,
        description: type.description || "",
        paid: type.paid ?? true,
        deductible: type.deductible ?? true,
        requiresAttachment: type.requiresAttachment ?? false,
        attachmentType: type.attachmentType || "",
        minTenureMonths: type.minTenureMonths ? String(type.minTenureMonths) : "",
        maxDurationDays: type.maxDurationDays ? String(type.maxDurationDays) : "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name || !formData.categoryId) {
        toast.error("Code, name, and category are required");
        return;
      }

      setLoading(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description || undefined,
        paid: formData.paid,
        deductible: formData.deductible,
        requiresAttachment: formData.requiresAttachment,
        attachmentType: formData.attachmentType || undefined,
        minTenureMonths: formData.minTenureMonths ? parseInt(formData.minTenureMonths) : undefined,
        maxDurationDays: formData.maxDurationDays ? parseInt(formData.maxDurationDays) : undefined,
      };

      if (editingId) {
        console.log("🔄 Updating leave type:", editingId, payload);
        await leavesService.updateType(editingId, payload);
        console.log("✅ Leave type updated successfully");
        toast.success("Leave type updated successfully");
      } else {
        console.log("🚀 Creating leave type:", payload);
        await leavesService.createType(payload);
        console.log("✅ Leave type created successfully");
        toast.success("Leave type created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error("❌ Error saving leave type:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.message || "Failed to save leave type");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat?.name || cat?.code || categoryId;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Types Management</h1>
            <p className="text-gray-600 mt-2">Create and manage leave types for your organization</p>
          </div>
          <Button onClick={() => openDialog()} size="lg">
            + Add New Leave Type
          </Button>
        </div>

        {/* Leave Types List */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Types</CardTitle>
            <CardDescription>Total: {leaveTypes.length} types</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && leaveTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading leave types...</div>
            ) : leaveTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No leave types found. Create one to get started!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Code</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Category</th>
                      <th className="px-4 py-3 text-left font-semibold">Settings</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveTypes.map((type) => (
                      <tr key={type._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-blue-600">{type.code}</td>
                        <td className="px-4 py-3 font-medium">{type.name}</td>
                        <td className="px-4 py-3 text-gray-600">{getCategoryName(type.categoryId)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {type.paid && <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>}
                            {type.deductible && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Deductible</Badge>}
                            {type.requiresAttachment && <Badge variant="secondary" className="bg-orange-100 text-orange-800">Requires Attachment</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            onClick={() => openDialog(type)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Leave Type" : "Add New Leave Type"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the leave type details" : "Create a new leave type for your organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Code & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <Input
                  placeholder="e.g., ANNUAL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={editingId !== null} // Code cannot be changed after creation
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input
                  placeholder="e.g., Annual Leave"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Category & Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name || cat.code || cat._id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Flags */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.paid}
                  onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Paid Leave</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.deductible}
                  onChange={(e) => setFormData({ ...formData, deductible: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Deductible from Balance</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresAttachment}
                  onChange={(e) => setFormData({ ...formData, requiresAttachment: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Requires Attachment</span>
              </label>
            </div>

            {/* Attachment Type (conditional) */}
            {formData.requiresAttachment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment Type</label>
                <Input
                  placeholder="e.g., Medical Certificate, Supporting Document"
                  value={formData.attachmentType}
                  onChange={(e) => setFormData({ ...formData, attachmentType: e.target.value })}
                />
              </div>
            )}

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Tenure (months)</label>
                <Input
                  type="number"
                  placeholder="e.g., 6"
                  value={formData.minTenureMonths}
                  onChange={(e) => setFormData({ ...formData, minTenureMonths: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (days)</label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.maxDurationDays}
                  onChange={(e) => setFormData({ ...formData, maxDurationDays: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : editingId ? "Update Type" : "Create Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
