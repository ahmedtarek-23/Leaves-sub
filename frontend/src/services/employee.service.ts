import api from "@/lib/api";

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    primaryDepartmentId?: string;
}

export const employeeService = {
    listAll: async () => {
        try {
            console.log("📋 Fetching all employees");
            const res = await api.get<Employee[]>("/employee-profile");
            console.log("✅ Employees fetched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ List employees error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },

    search: async (query: string) => {
        try {
            console.log("🔍 Searching employees:", query);
            const res = await api.get<Employee[]>(`/employee-profile?search=${query}`);
            console.log("✅ Employees searched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Search employees error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },

    getById: async (id: string) => {
        try {
            console.log("👤 Fetching employee:", id);
            const res = await api.get<Employee>(`/employee-profile/${id}`);
            console.log("✅ Employee fetched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Get employee error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },
};

export default employeeService;
