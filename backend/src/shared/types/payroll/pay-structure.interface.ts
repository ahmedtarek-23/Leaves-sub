import { IPayComponent } from './payroll-utils.interface';
import { IOrgUnit } from './external-deps.interface'; // NEW IMPORT

/**
 * Interface for a Pay Structure, typically representing a Pay Grade or Salary Band.
 * This links an Employee to their compensation components.
 */
export interface IPayStructure {
  payGradeId: string; // Unique identifier for the pay grade (e.g., 'PG3', 'SE_L5')
  gradeName: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ARCHIVED';

  // --- Base Compensation ---
  grossSalary: number; // The total fixed gross salary before specific allowances/deductions

  // --- Components from Pay Grade Definition (Phase 1) ---
  allowances: IPayComponent[]; // Fixed, recurring additions (e.g., Housing, Transportation)
  deductions: IPayComponent[]; // Fixed, recurring deductions (e.g., union fees, fixed loan payment)

  // --- External Context/Integration Awareness (Dependency Awareness) ---
  // The department(s) or org units this pay structure is valid for (linking to Org Structure).
  validForDepartments: Pick<IOrgUnit, 'departmentId' | 'departmentCode'>[];
  associatedPositions: string[]; // Array of Position IDs or Job Titles linked to this pay grade
  contractType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';

  // Audit and Approval
  configuredByUserId: string;
  lastApprovedByUserId: string;
  approvedDate: Date;
}
