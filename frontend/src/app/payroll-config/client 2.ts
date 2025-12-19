import {
  ChangeStatusDto,
  CreateAllowanceDto,
  CreateCompanySettingsDto,
  CreateInsuranceDto,
  CreatePayGradeDto,
  CreatePayTypeDto,
  CreatePayrollPolicyDto,
  CreateSigningBonusDto,
  CreateTaxRuleDto,
  CreateTerminationBenefitDto,
  Allowance,
  CompanySettings,
  InsuranceBracket,
  PayGrade,
  PayType,
  PayrollPolicy,
  SigningBonus,
  TaxRule,
  TerminationBenefit,
  UpdateAllowanceDto,
  UpdateCompanySettingsDto,
  UpdateInsuranceDto,
  UpdatePayGradeDto,
  UpdatePayTypeDto,
  UpdatePayrollPolicyDto,
  UpdateSigningBonusDto,
  UpdateTaxRuleDto,
  UpdateTerminationBenefitDto,
} from "@/types/payroll-config";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

const authHeaders = () => {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  // Some delete endpoints return a message only
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return undefined as unknown as T;
}

const createCrudApi = <C, U, R = unknown>(basePath: string) => ({
  getAll: async (): Promise<R[]> => request<R[]>(basePath, { method: "GET" }),
  get: async (id: string): Promise<R> => request<R>(`${basePath}/${id}`, { method: "GET" }),
  getById: async (id: string): Promise<R> => request<R>(`${basePath}/${id}`, { method: "GET" }),
  create: async (payload: C): Promise<R> =>
    request<R>(basePath, { method: "POST", body: JSON.stringify(payload) }),
  update: async (id: string, payload: U): Promise<R> =>
    request<R>(`${basePath}/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  changeStatus: async (id: string, payload: ChangeStatusDto): Promise<R> =>
    request<R>(`${basePath}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: async (id: string): Promise<R> => request<R>(`${basePath}/${id}`, { method: "DELETE" }),
});

export const payrollPoliciesApi = createCrudApi<
  CreatePayrollPolicyDto,
  UpdatePayrollPolicyDto,
  PayrollPolicy
>("/payroll-config/policies");

export const taxRulesApi = createCrudApi<CreateTaxRuleDto, UpdateTaxRuleDto, TaxRule>(
  "/payroll-config/tax-rules"
);

export const signingBonusesApi = createCrudApi<
  CreateSigningBonusDto,
  UpdateSigningBonusDto,
  SigningBonus
>("/payroll-config/signing-bonuses");

export const terminationBenefitsApi = createCrudApi<
  CreateTerminationBenefitDto,
  UpdateTerminationBenefitDto,
  TerminationBenefit
>("/payroll-config/termination-benefits");

export const allowancesApi = createCrudApi<
  CreateAllowanceDto,
  UpdateAllowanceDto,
  Allowance
>("/payroll-config/allowances");

export const insuranceApi = createCrudApi<CreateInsuranceDto, UpdateInsuranceDto, InsuranceBracket>(
  "/payroll-config/insurance"
);

export const payGradesApi = createCrudApi<CreatePayGradeDto, UpdatePayGradeDto, PayGrade>(
  "/payroll-config/pay-grades"
);

export const payTypesApi = createCrudApi<CreatePayTypeDto, UpdatePayTypeDto, PayType>(
  "/payroll-config/pay-types"
);

export const companySettingsApi = {
  get: async (): Promise<CompanySettings> =>
    request("/payroll-config/settings", { method: "GET" }),
  create: async (payload: CreateCompanySettingsDto): Promise<CompanySettings> =>
    request("/payroll-config/settings", { method: "POST", body: JSON.stringify(payload) }),
  update: async (payload: UpdateCompanySettingsDto): Promise<CompanySettings> =>
    request("/payroll-config/settings", { method: "PUT", body: JSON.stringify(payload) }),
};
