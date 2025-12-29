import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

/* --------------  REGISTER SCHEMAS  -------------- */
import { EmployeeProfileSchema } from '../src/employee-profile/models/employee-profile.schema';
import { EmployeeSystemRoleSchema } from '../src/employee-profile/models/employee-system-role.schema';
import { EmployeeQualificationSchema } from '../src/employee-profile/models/qualification.schema';
import { EmployeeProfileChangeRequestSchema } from '../src/employee-profile/models/ep-change-request.schema';
import { DepartmentSchema } from '../src/organization-structure/models/department.schema';
import { PositionSchema } from '../src/organization-structure/models/position.schema';

mongoose.model('EmployeeProfile', EmployeeProfileSchema);
mongoose.model('EmployeeSystemRole', EmployeeSystemRoleSchema);
mongoose.model('EmployeeQualification', EmployeeQualificationSchema);
mongoose.model('EmployeeProfileChangeRequest', EmployeeProfileChangeRequestSchema);
mongoose.model('Department', DepartmentSchema);
mongoose.model('Position', PositionSchema);
/* ------------------------------------------------ */

import { EmployeeProfile } from '../src/employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../src/employee-profile/models/employee-system-role.schema';
import { EmployeeQualification } from '../src/employee-profile/models/qualification.schema';
import { EmployeeProfileChangeRequest } from '../src/employee-profile/models/ep-change-request.schema';
import { Department } from '../src/organization-structure/models/department.schema';
import { Position } from '../src/organization-structure/models/position.schema';
import {
  ContractType,
  EmployeeStatus,
  Gender,
  GraduationType,
  MaritalStatus,
  ProfileChangeStatus,
  SystemRole,
  WorkType,
} from '../src/employee-profile/enums/employee-profile.enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';

/* ================================================================ */
/* Models                                                            */
/* ================================================================ */
const EmployeeProfileModel = mongoose.model(EmployeeProfile.name);
const EmployeeSystemRoleModel = mongoose.model(EmployeeSystemRole.name);
const EmployeeQualificationModel = mongoose.model(EmployeeQualification.name);
const EmployeeProfileChangeRequestModel = mongoose.model(EmployeeProfileChangeRequest.name);
const DepartmentModel = mongoose.model(Department.name);
const PositionModel = mongoose.model(Position.name);

/* ================================================================ */
/* Helper Functions                                                  */
/* ================================================================ */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

function mapBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T> {
  return Object.fromEntries(arr.map(i => [i[key], i]));
}

function generateFullName(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return '';
  return `${firstName} ${lastName}`.trim();
}

function generateDateOfBirth(age: number = 30): Date {
  const birthYear = new Date().getFullYear() - age;
  return new Date(`${birthYear}-01-01`);
}

/* ================================================================ */
/* Employee Data                                                     */
/* ================================================================ */
const employeesData = [
  // Core Employees
  {
    firstName: 'Alice',
    lastName: 'Smith',
    employeeNumber: 'EMP-001',
    nationalId: 'NAT-ALICE-001',
    workEmail: 'alice@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'HR-001',
    positionCode: 'POS-HR-MGR',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    bankName: 'First National Bank',
    bankAccountNumber: 'FNB-001-2020',
    dateOfBirth: generateDateOfBirth(35),
    personalEmail: 'alice.personal@email.com',
    mobilePhone: '+12345678901'
  },
  {
    firstName: 'Bob',
    lastName: 'Jones',
    employeeNumber: 'EMP-002',
    nationalId: 'NAT-BOB-002',
    workEmail: 'bob@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    deptCode: 'FIN-001',
    positionCode: 'POS-ACC',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    bankName: 'Metro CU',
    bankAccountNumber: 'MCU-002-2021',
    dateOfBirth: generateDateOfBirth(32),
    personalEmail: 'bob.personal@email.com',
    mobilePhone: '+12345678902'
  },
  {
    firstName: 'Charlie',
    lastName: 'Brown',
    employeeNumber: 'EMP-003',
    nationalId: 'NAT-CHARLIE-003',
    workEmail: 'charlie@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'SALES-001',
    positionCode: 'POS-SALES-REP',
    contractType: ContractType.PART_TIME_CONTRACT,
    workType: WorkType.PART_TIME,
    dateOfBirth: generateDateOfBirth(28),
    personalEmail: 'charlie.personal@email.com',
    mobilePhone: '+12345678903'
  },
  {
    firstName: 'Diana',
    lastName: 'Prince',
    employeeNumber: 'EMP-004',
    nationalId: 'NAT-DIANA-004',
    workEmail: 'diana@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.DIVORCED,
    deptCode: 'ENG-001',
    positionCode: 'POS-SENIOR-SWE',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(40),
    personalEmail: 'diana.personal@email.com',
    mobilePhone: '+12345678904'
  },
  {
    firstName: 'Eric',
    lastName: 'Stone',
    employeeNumber: 'EMP-005',
    nationalId: 'NAT-ERIC-005',
    workEmail: 'eric@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.WIDOWED,
    deptCode: 'ENG-001',
    positionCode: 'POS-SWE',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(29),
    personalEmail: 'eric.personal@email.com',
    mobilePhone: '+12345678905'
  },
  {
    firstName: 'Fatima',
    lastName: 'Hassan',
    employeeNumber: 'EMP-006',
    nationalId: 'NAT-FATIMA-006',
    workEmail: 'fatima@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'HR-001',
    positionCode: 'POS-HR-MGR',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(38),
    personalEmail: 'fatima.personal@email.com',
    mobilePhone: '+12345678906'
  },
  {
    firstName: 'George',
    lastName: 'Ibrahim',
    employeeNumber: 'EMP-007',
    nationalId: 'NAT-GEORGE-007',
    workEmail: 'george@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    deptCode: 'HR-001',
    positionCode: 'POS-HR-GEN',
    contractType: ContractType.PART_TIME_CONTRACT,
    workType: WorkType.PART_TIME,
    dateOfBirth: generateDateOfBirth(45),
    personalEmail: 'george.personal@email.com',
    mobilePhone: '+12345678907'
  },
  {
    firstName: 'Hannah',
    lastName: 'Lee',
    employeeNumber: 'EMP-008',
    nationalId: 'NAT-HANNAH-008',
    workEmail: 'hannah@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'FIN-001',
    positionCode: 'POS-ACC',
    contractType: ContractType.PART_TIME_CONTRACT,
    workType: WorkType.PART_TIME,
    dateOfBirth: generateDateOfBirth(31),
    personalEmail: 'hannah.personal@email.com',
    mobilePhone: '+12345678908'
  },
  {
    firstName: 'Ian',
    lastName: 'Clark',
    employeeNumber: 'EMP-009',
    nationalId: 'NAT-IAN-009',
    workEmail: 'ian@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.DIVORCED,
    deptCode: 'HR-001',
    positionCode: 'POS-HR-GEN',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(42),
    personalEmail: 'ian.personal@email.com',
    mobilePhone: '+12345678909'
  },
  {
    firstName: 'Kevin',
    lastName: 'Adams',
    employeeNumber: 'EMP-010',
    nationalId: 'NAT-KEVIN-010',
    workEmail: 'kevin@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    deptCode: 'HR-001',
    positionCode: 'POS-HR-GEN',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(36),
    personalEmail: 'kevin.personal@email.com',
    mobilePhone: '+12345678910'
  },
  {
    firstName: 'Lina',
    lastName: 'Park',
    employeeNumber: 'EMP-011',
    nationalId: 'NAT-LINA-011',
    workEmail: 'lina@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'ENG-001',
    positionCode: 'POS-QA-ENG',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(27),
    personalEmail: 'lina.personal@email.com',
    mobilePhone: '+12345678911'
  },
  {
    firstName: 'Paula',
    lastName: 'Payne',
    employeeNumber: 'EMP-012',
    nationalId: 'NAT-PAULA-012',
    workEmail: 'paula@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'FIN-001',
    positionCode: 'POS-ACC',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(33),
    personalEmail: 'paula.personal@email.com',
    mobilePhone: '+12345678912'
  },
  {
    firstName: 'Rami',
    lastName: 'Reed',
    employeeNumber: 'EMP-013',
    nationalId: 'NAT-RAMI-013',
    workEmail: 'rami@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'HR-001',
    positionCode: 'POS-HR-GEN',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(39),
    personalEmail: 'rami.personal@email.com',
    mobilePhone: '+12345678913'
  },
  {
    firstName: 'Sarah',
    lastName: 'Nguyen',
    employeeNumber: 'EMP-014',
    nationalId: 'NAT-SARAH-014',
    workEmail: 'sarah.senior.swe@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'ENG-001',
    positionCode: 'POS-SENIOR-SWE',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(37),
    personalEmail: 'sarah.personal@email.com',
    mobilePhone: '+12345678914'
  },
  {
    firstName: 'Samir',
    lastName: 'Saleh',
    employeeNumber: 'EMP-015',
    nationalId: 'NAT-SAMIR-015',
    workEmail: 'samir.sales.lead@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    deptCode: 'SALES-001',
    positionCode: 'POS-SALES-LEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(41),
    personalEmail: 'samir.personal@email.com',
    mobilePhone: '+12345678915'
  },
  {
    firstName: 'Tariq',
    lastName: 'Adel',
    employeeNumber: 'EMP-016',
    nationalId: 'NAT-TARIQ-016',
    workEmail: 'tariq.ta@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'LND-001',
    positionCode: 'POS-TA',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(26),
    personalEmail: 'tariq.personal@email.com',
    mobilePhone: '+12345678916'
  },
  {
    firstName: 'Laila',
    lastName: 'Abbas',
    employeeNumber: 'EMP-017',
    nationalId: 'NAT-LAILA-017',
    workEmail: 'laila.la@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'LND-001',
    positionCode: 'POS-LA',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(29),
    personalEmail: 'laila.personal@email.com',
    mobilePhone: '+12345678917'
  },
  {
    firstName: 'Amir',
    lastName: 'Nabil',
    employeeNumber: 'EMP-018',
    nationalId: 'NAT-AMIR-018',
    workEmail: 'amir.accountant@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    deptCode: 'FIN-001',
    positionCode: 'POS-ACC',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(34),
    personalEmail: 'amir.personal@email.com',
    mobilePhone: '+12345678918'
  },
  {
    firstName: 'Salma',
    lastName: 'Khaled',
    employeeNumber: 'EMP-019',
    nationalId: 'NAT-SALMA-019',
    workEmail: 'salma.librarian@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'LIB-001',
    positionCode: 'POS-LIB',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(30),
    personalEmail: 'salma.personal@email.com',
    mobilePhone: '+12345678919'
  },
  {
    firstName: 'Tess',
    lastName: 'Headley',
    employeeNumber: 'EMP-TEST-020',
    nationalId: 'NAT-TEST-HEAD-020',
    workEmail: 'tess.headley@company.com',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'TEST-001',
    positionCode: 'POS-TEST-HEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(43),
    personalEmail: 'tess.personal@email.com',
    mobilePhone: '+12345678920'
  },
  {
    firstName: 'Evan',
    lastName: 'Tester',
    employeeNumber: 'EMP-TEST-021',
    nationalId: 'NAT-TEST-EMP-021',
    workEmail: 'evan.tester@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'TEST-001',
    positionCode: 'POS-TEST-EMP',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(25),
    personalEmail: 'evan.personal@email.com',
    mobilePhone: '+12345678921'
  },
  // Inactive Department Employee
  {
    firstName: 'Inactive',
    lastName: 'Operations',
    employeeNumber: 'EMP-INACTIVE-OPS-001-INACTIVE',
    nationalId: 'NAT-INACTIVE-OPS-001-INACTIVE',
    workEmail: 'inactive.ops-001-inactive@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'OPS-001-INACTIVE',
    positionCode: 'POS-OPS-INACTIVE',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(48),
    personalEmail: 'inactive.personal@email.com',
    mobilePhone: '+12345678922'
  },
  // Department Heads
  {
    firstName: 'Head',
    lastName: 'Engineering',
    employeeNumber: 'EMP-HEAD-ENG-001',
    nationalId: 'NAT-HEAD-ENG-001',
    workEmail: 'head.eng-001@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'ENG-001',
    positionCode: 'POS-ENG-001-HEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(45),
    personalEmail: 'head.eng.personal@email.com',
    mobilePhone: '+12345678923'
  },
  {
    firstName: 'Head',
    lastName: 'Sales',
    employeeNumber: 'EMP-HEAD-SALES-001',
    nationalId: 'NAT-HEAD-SALES-001',
    workEmail: 'head.sales-001@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'SALES-001',
    positionCode: 'POS-SALES-001-HEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(44),
    personalEmail: 'head.sales.personal@email.com',
    mobilePhone: '+12345678924'
  },
  {
    firstName: 'Head',
    lastName: 'Learning and Development',
    employeeNumber: 'EMP-HEAD-LND-001',
    nationalId: 'NAT-HEAD-LND-001',
    workEmail: 'head.lnd-001@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'LND-001',
    positionCode: 'POS-LND-001-HEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(46),
    personalEmail: 'head.lnd.personal@email.com',
    mobilePhone: '+12345678925'
  },
  {
    firstName: 'Head',
    lastName: 'Finance',
    employeeNumber: 'EMP-HEAD-FIN-001',
    nationalId: 'NAT-HEAD-FIN-001',
    workEmail: 'head.fin-001@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'FIN-001',
    positionCode: 'POS-FIN-001-HEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(50),
    personalEmail: 'head.fin.personal@email.com',
    mobilePhone: '+12345678926'
  },
  {
    firstName: 'Head',
    lastName: 'Library Services',
    employeeNumber: 'EMP-HEAD-LIB-001',
    nationalId: 'NAT-HEAD-LIB-001',
    workEmail: 'head.lib-001@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'LIB-001',
    positionCode: 'POS-LIB-001-HEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(47),
    personalEmail: 'head.lib.personal@email.com',
    mobilePhone: '+12345678927'
  },
  {
    firstName: 'Head',
    lastName: 'Operations',
    employeeNumber: 'EMP-HEAD-OPS-001-INACTIVE',
    nationalId: 'NAT-HEAD-OPS-001-INACTIVE',
    workEmail: 'head.ops-001-inactive@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'OPS-001-INACTIVE',
    positionCode: 'POS-OPS-001-INACTIVE-HEAD',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(49),
    personalEmail: 'head.ops.personal@email.com',
    mobilePhone: '+12345678928'
  },
  {
    firstName: 'Head',
    lastName: 'Human Resources',
    employeeNumber: 'EMP-HEAD-HR-001',
    nationalId: 'NAT-HEAD-HR-001',
    workEmail: 'head.hr-001@company.com',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'HR-001',
    positionCode: 'POS-HR-MGR',
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfBirth: generateDateOfBirth(52),
    personalEmail: 'head.hr.personal@email.com',
    mobilePhone: '+12345678929'
  },
];

// System Roles Mapping
const roleMap: Record<string, { roles: SystemRole[]; permissions: string[] }> = {
  'alice@company.com': { roles: [SystemRole.HR_MANAGER], permissions: ['org.manage', 'hr.manage'] },
  'bob@company.com': { roles: [SystemRole.PAYROLL_SPECIALIST], permissions: ['payroll.process'] },
  'charlie@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: [] },
  'diana@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'eric@company.com': { roles: [SystemRole.HR_EMPLOYEE], permissions: ['hr.view'] },
  'fatima@company.com': { roles: [SystemRole.SYSTEM_ADMIN], permissions: ['system.admin'] },
  'george@company.com': { roles: [SystemRole.HR_EMPLOYEE], permissions: ['hr.view'] },
  'hannah@company.com': { roles: [SystemRole.FINANCE_STAFF], permissions: ['finance.view'] },
  'ian@company.com': { roles: [SystemRole.HR_ADMIN], permissions: ['hr.manage'] },
  'kevin@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: [] },
  'lina@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: [] },
  'paula@company.com': { roles: [SystemRole.FINANCE_STAFF], permissions: ['finance.view'] },
  'rami@company.com': { roles: [SystemRole.HR_ADMIN], permissions: ['hr.manage'] },
  'sarah.senior.swe@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'samir.sales.lead@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'tariq.ta@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'laila.la@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'amir.accountant@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['finance.view'] },
  'salma.librarian@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'evan.tester@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'inactive.ops-001-inactive@company.com': { roles: [SystemRole.DEPARTMENT_EMPLOYEE], permissions: ['org.read'] },
  'head.eng-001@company.com': { roles: [SystemRole.DEPARTMENT_HEAD], permissions: ['org.manage.department'] },
  'head.sales-001@company.com': { roles: [SystemRole.DEPARTMENT_HEAD], permissions: ['org.manage.department'] },
  'head.lnd-001@company.com': { roles: [SystemRole.DEPARTMENT_HEAD], permissions: ['org.manage.department'] },
  'head.fin-001@company.com': { roles: [SystemRole.DEPARTMENT_HEAD], permissions: ['org.manage.department'] },
  'head.lib-001@company.com': { roles: [SystemRole.DEPARTMENT_HEAD], permissions: ['org.manage.department'] },
  'head.ops-001-inactive@company.com': { roles: [SystemRole.DEPARTMENT_HEAD], permissions: ['org.manage.department'] },
  'head.hr-001@company.com': { roles: [SystemRole.DEPARTMENT_HEAD], permissions: ['org.manage.department'] },
};

// Qualifications
const qualifications = [
  { email: 'alice@company.com', establishmentName: 'Cairo University', graduationType: GraduationType.MASTER },
  { email: 'bob@company.com', establishmentName: 'AUC', graduationType: GraduationType.BACHELOR },
];

// Profile Change Request
const changeRequest = {
  requestId: 'REQ-EP-001',
  employeeEmail: 'charlie@company.com',
  requestDescription: 'Update work email to charlie.sales@company.com',
  reason: 'Team branding alignment',
  status: ProfileChangeStatus.PENDING,
};

/* ================================================================ */
/* Main Seed Function                                               */
/* ================================================================ */
async function seed(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log('🔗 Connected to MongoDB');

  // Clean slate
  await EmployeeProfileModel.deleteMany({});
  await EmployeeSystemRoleModel.deleteMany({});
  await EmployeeQualificationModel.deleteMany({});
  await EmployeeProfileChangeRequestModel.deleteMany({});
  console.log('🧹 Cleared old employee data');

  // Validate data before insertion
  const invalidEmployees = employeesData.filter(e => !e.lastName || e.lastName.trim() === '');
  if (invalidEmployees.length > 0) {
    console.error('❌ Found employees with empty last names:');
    invalidEmployees.forEach(emp => {
      console.error(`  - ${emp.firstName} (${emp.workEmail})`);
    });
    throw new Error('Cannot seed employees with empty last names');
  }

  // Fetch org-structure data
  const deptDocs = await DepartmentModel.find({});
  const posDocs = await PositionModel.find({});
  
  if (deptDocs.length === 0 || posDocs.length === 0) {
    console.error('❌ Organization structure not found!');
    console.error('   Please seed departments and positions first.');
    await mongoose.disconnect();
    return;
  }
  
  const deptMap = mapBy(deptDocs, 'deptCode');
  const posMap = mapBy(posDocs, 'posCode');

  console.log(`📊 Found ${deptDocs.length} departments and ${posDocs.length} positions`);

  // Generate bcrypt hash for password
  console.log('🔑 Generating secure passwords...');
  const DEFAULT_PASSWORD = 'ChangeMe123';
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
  
  // 1. Create Employee Profiles
  console.log('\n👥 Creating employee profiles...');
  const profileCreationPromises = employeesData.map(async (employee) => {
    const dept = deptMap[employee.deptCode];
    const position = posMap[employee.positionCode];
    
    if (!dept) {
      console.warn(`⚠️  Department not found for ${employee.workEmail}: ${employee.deptCode}`);
    }
    if (!position) {
      console.warn(`⚠️  Position not found for ${employee.workEmail}: ${employee.positionCode}`);
    }

    return {
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: generateFullName(employee.firstName, employee.lastName),
      nationalId: employee.nationalId,
      gender: employee.gender,
      maritalStatus: employee.maritalStatus,
      employeeNumber: employee.employeeNumber,
      dateOfHire: new Date('2020-01-01'),
      workEmail: employee.workEmail,
      personalEmail: employee.personalEmail,
      mobilePhone: employee.mobilePhone,
      contractType: employee.contractType,
      workType: employee.workType,
      status: EmployeeStatus.ACTIVE,
      statusEffectiveFrom: new Date(),
      primaryDepartmentId: dept?._id,
      primaryPositionId: position?._id,
      supervisorPositionId: dept?.headPositionId,
      bankName: employee.bankName,
      bankAccountNumber: employee.bankAccountNumber,
      password: hashedPassword,
      contractStartDate: new Date('2020-01-01'),
      dateOfBirth: employee.dateOfBirth,
      address: {
        city: 'Cairo',
        streetAddress: '123 Main St',
        country: 'Egypt'
      }
    };
  });

  const profileData = await Promise.all(profileCreationPromises);
  const profileDocs = await EmployeeProfileModel.insertMany(profileData);
  console.log(`✅ Created ${profileDocs.length} employee profiles`);
  
  const emailToId = mapBy(profileDocs, 'workEmail');

  // 2. Create System Roles
  console.log('\n🎭 Creating system roles...');
  const systemRolePromises = Object.entries(roleMap).map(async ([email, { roles, permissions }]) => {
    const employee = emailToId[email];
    if (!employee) {
      console.warn(`⚠️  Employee not found for role assignment: ${email}`);
      return null;
    }
    
    return {
      employeeProfileId: employee._id,
      roles,
      permissions,
      isActive: true,
    };
  });

  const validSystemRoles = (await Promise.all(systemRolePromises)).filter(Boolean);
  await EmployeeSystemRoleModel.insertMany(validSystemRoles as any[]);
  console.log(`✅ Created ${validSystemRoles.length} system role assignments`);

  // 3. Create Qualifications
  console.log('\n🎓 Creating qualifications...');
  const qualificationPromises = qualifications.map(async (qual) => {
    const employee = emailToId[qual.email];
    if (!employee) {
      console.warn(`⚠️  Employee not found for qualification: ${qual.email}`);
      return null;
    }
    
    return {
      employeeProfileId: employee._id,
      establishmentName: qual.establishmentName,
      graduationType: qual.graduationType,
    };
  });

  const validQualifications = (await Promise.all(qualificationPromises)).filter(Boolean);
  await EmployeeQualificationModel.insertMany(validQualifications as any[]);
  console.log(`✅ Created ${validQualifications.length} qualifications`);

  // 4. Create Change Request
  console.log('\n📋 Creating profile change request...');
  const changeEmployee = emailToId[changeRequest.employeeEmail];
  if (changeEmployee) {
    await EmployeeProfileChangeRequestModel.create({
      requestId: changeRequest.requestId,
      employeeProfileId: changeEmployee._id,
      requestDescription: changeRequest.requestDescription,
      reason: changeRequest.reason,
      status: changeRequest.status,
      submittedAt: new Date(),
    });
    console.log(`✅ Created change request: ${changeRequest.requestId}`);
  }

  console.log('\n🎉 EMPLOYEE SEEDING COMPLETE!');
  console.log('\n📋 Summary:');
  console.log(`   - Employee Profiles: ${profileDocs.length}`);
  console.log(`   - System Roles: ${validSystemRoles.length}`);
  console.log(`   - Qualifications: ${validQualifications.length}`);
  console.log(`   - Change Request: ${changeEmployee ? '✅ Created' : '❌ Failed'}`);
  console.log(`\n🔑 Default password for all users: "${DEFAULT_PASSWORD}"`);
  
  // Verify critical users
  console.log('\n✅ Critical Users Verification:');
  const criticalUsers = ['alice@company.com', 'bob@company.com', 'charlie@company.com'];
  for (const email of criticalUsers) {
    const user = emailToId[email];
    if (user) {
      console.log(`   ✅ ${email}: Profile created`);
    }
  }
  
  await mongoose.disconnect();
}

seed().catch(console.error);
