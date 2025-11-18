// src for External System Data Awareness (Milestone 1 Integration Foundation)

/**
 * Minimal interface required from the Organization Structure (OS) module
 * to link Pay Structures and policies to the organizational hierarchy.
 */
export interface IOrgUnit {
  departmentId: string; // The MongoDB ID of the Department or Org Unit (from departmentdummydata.json)
  departmentCode: string;
  name: string;
}

/**
 * Minimal interface required from the Employee Profile (EP) module
 * for service-level testing (linking employee to a pay grade).
 */
export interface IEmployeeBasic {
  employeeId: string; // Unique Employee ID
  firstName: string;
  lastName: string;
  payGradeId: string; // The crucial link to your IPayStructure (from positiondummydata.json)
  departmentId: string; // Used to check against pay structure association (from employee_dummydata.json)
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

/**
 * Minimal interface required from the Organization Structure (OS) module
 * to define roles for approval workflows.
 */
export interface IPositionBasic {
  positionId: string;
  title: string; // e.g., 'Payroll Specialist', 'HR Manager'
  payGrade: string; // The pay grade associated with the position (e.g., 'PG5')
  reportsTo: string | null; // Manager's positionId
}
