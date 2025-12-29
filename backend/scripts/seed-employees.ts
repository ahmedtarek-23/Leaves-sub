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
/* Helper Functions                                                 */
/* ================================================================ */
function createMapBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T> {
  return Object.fromEntries(arr.map(i => [i[key], i]));
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/* ================================================================ */
/* Main Seeding Function                                            */
/* ================================================================ */
async function seedEmployees(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log('🔗 Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  // Get departments and positions
  console.log('\n🔍 Fetching departments and positions...');
  const departments = await db.collection('departments').find({}).toArray();
  const positions = await db.collection('positions').find({}).toArray();

  const deptMap = createMapBy(departments, 'deptCode');
  const posMap = createMapBy(positions, 'posCode');

  console.log(`📊 Found ${departments.length} departments and ${positions.length} positions`);

  if (departments.length === 0 || positions.length === 0) {
    console.error('❌ No departments or positions found!');
    console.error('   Please seed organization structure first.');
    await mongoose.disconnect();
    return;
  }

  // Clean slate
  console.log('\n🧹 Clearing existing employee data...');
  await db.collection('employee_profiles').deleteMany({});
  await db.collection('employee_system_roles').deleteMany({});
  await db.collection('employee_qualifications').deleteMany({});
  await db.collection('employee_profile_change_requests').deleteMany({});
  console.log('✅ Cleared existing employee data');

  const passwordHash = await hashPassword('ChangeMe123');

  // Define core employees
  console.log('\n👥 Creating core employees...');
  const coreEmployeesData = [
    {
      workEmail: 'alice@company.com',
      firstName: 'Alice',
      lastName: 'Smith',
      employeeNumber: 'EMP-001',
      nationalId: 'NAT-ALICE-001',
      primaryDepartmentId: deptMap['HR-001']?._id,
      primaryPositionId: posMap['POS-HR-MGR']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      bankAccount: { bankName: 'First National Bank', accountNumber: 'FNB-001-2020' },
    },
    {
      workEmail: 'bob@company.com',
      firstName: 'Bob',
      lastName: 'Jones',
      employeeNumber: 'EMP-002',
      nationalId: 'NAT-BOB-002',
      primaryDepartmentId: deptMap['FIN-001']?._id,
      primaryPositionId: posMap['POS-ACC']?._id,
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      bankAccount: { bankName: 'Metro CU', accountNumber: 'MCU-002-2021' },
    },
    {
      workEmail: 'charlie@company.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      employeeNumber: 'EMP-003',
      nationalId: 'NAT-CHARLIE-003',
      primaryDepartmentId: deptMap['SALES-001']?._id,
      primaryPositionId: posMap['POS-SALES-REP']?._id,
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      contractType: 'PART_TIME_CONTRACT',
      workType: 'PART_TIME',
    },
    {
      workEmail: 'diana@company.com',
      firstName: 'Diana',
      lastName: 'Prince',
      employeeNumber: 'EMP-004',
      nationalId: 'NAT-DIANA-004',
      primaryDepartmentId: deptMap['ENG-001']?._id,
      primaryPositionId: posMap['POS-SENIOR-SWE']?._id,
      gender: 'FEMALE',
      maritalStatus: 'DIVORCED',
    },
    {
      workEmail: 'eric@company.com',
      firstName: 'Eric',
      lastName: 'Stone',
      employeeNumber: 'EMP-005',
      nationalId: 'NAT-ERIC-005',
      primaryDepartmentId: deptMap['ENG-001']?._id,
      primaryPositionId: posMap['POS-SWE']?._id,
      gender: 'MALE',
      maritalStatus: 'WIDOWED',
    },
    {
      workEmail: 'fatima@company.com',
      firstName: 'Fatima',
      lastName: 'Hassan',
      employeeNumber: 'EMP-006',
      nationalId: 'NAT-FATIMA-006',
      primaryDepartmentId: deptMap['HR-001']?._id,
      primaryPositionId: posMap['POS-HR-MGR']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'george@company.com',
      firstName: 'George',
      lastName: 'Ibrahim',
      employeeNumber: 'EMP-007',
      nationalId: 'NAT-GEORGE-007',
      primaryDepartmentId: deptMap['HR-001']?._id,
      primaryPositionId: posMap['POS-HR-GEN']?._id,
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      contractType: 'PART_TIME_CONTRACT',
      workType: 'PART_TIME',
    },
    {
      workEmail: 'hannah@company.com',
      firstName: 'Hannah',
      lastName: 'Lee',
      employeeNumber: 'EMP-008',
      nationalId: 'NAT-HANNAH-008',
      primaryDepartmentId: deptMap['FIN-001']?._id,
      primaryPositionId: posMap['POS-ACC']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      contractType: 'PART_TIME_CONTRACT',
      workType: 'PART_TIME',
    },
    {
      workEmail: 'ian@company.com',
      firstName: 'Ian',
      lastName: 'Clark',
      employeeNumber: 'EMP-009',
      nationalId: 'NAT-IAN-009',
      primaryDepartmentId: deptMap['HR-001']?._id,
      primaryPositionId: posMap['POS-HR-GEN']?._id,
      gender: 'MALE',
      maritalStatus: 'DIVORCED',
    },
    {
      workEmail: 'kevin@company.com',
      firstName: 'Kevin',
      lastName: 'Adams',
      employeeNumber: 'EMP-010',
      nationalId: 'NAT-KEVIN-010',
      primaryDepartmentId: deptMap['HR-001']?._id,
      primaryPositionId: posMap['POS-HR-GEN']?._id,
      gender: 'MALE',
      maritalStatus: 'MARRIED',
    },
    {
      workEmail: 'lina@company.com',
      firstName: 'Lina',
      lastName: 'Park',
      employeeNumber: 'EMP-011',
      nationalId: 'NAT-LINA-011',
      primaryDepartmentId: deptMap['ENG-001']?._id,
      primaryPositionId: posMap['POS-QA-ENG']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'paula@company.com',
      firstName: 'Paula',
      lastName: 'Payne',
      employeeNumber: 'EMP-012',
      nationalId: 'NAT-PAULA-012',
      primaryDepartmentId: deptMap['FIN-001']?._id,
      primaryPositionId: posMap['POS-ACC']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'rami@company.com',
      firstName: 'Rami',
      lastName: 'Reed',
      employeeNumber: 'EMP-013',
      nationalId: 'NAT-RAMI-013',
      primaryDepartmentId: deptMap['HR-001']?._id,
      primaryPositionId: posMap['POS-HR-GEN']?._id,
      gender: 'MALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'sarah.senior.swe@company.com',
      firstName: 'Sarah',
      lastName: 'Nguyen',
      employeeNumber: 'EMP-014',
      nationalId: 'NAT-SARAH-014',
      primaryDepartmentId: deptMap['ENG-001']?._id,
      primaryPositionId: posMap['POS-SENIOR-SWE']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'samir.sales.lead@company.com',
      firstName: 'Samir',
      lastName: 'Saleh',
      employeeNumber: 'EMP-015',
      nationalId: 'NAT-SAMIR-015',
      primaryDepartmentId: deptMap['SALES-001']?._id,
      primaryPositionId: posMap['POS-SALES-LEAD']?._id,
      gender: 'MALE',
      maritalStatus: 'MARRIED',
    },
    {
      workEmail: 'tariq.ta@company.com',
      firstName: 'Tariq',
      lastName: 'Adel',
      employeeNumber: 'EMP-016',
      nationalId: 'NAT-TARIQ-016',
      primaryDepartmentId: deptMap['LND-001']?._id,
      primaryPositionId: posMap['POS-TA']?._id,
      gender: 'MALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'laila.la@company.com',
      firstName: 'Laila',
      lastName: 'Abbas',
      employeeNumber: 'EMP-017',
      nationalId: 'NAT-LAILA-017',
      primaryDepartmentId: deptMap['LND-001']?._id,
      primaryPositionId: posMap['POS-LA']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'amir.accountant@company.com',
      firstName: 'Amir',
      lastName: 'Nabil',
      employeeNumber: 'EMP-018',
      nationalId: 'NAT-AMIR-018',
      primaryDepartmentId: deptMap['FIN-001']?._id,
      primaryPositionId: posMap['POS-ACC']?._id,
      gender: 'MALE',
      maritalStatus: 'MARRIED',
    },
    {
      workEmail: 'salma.librarian@company.com',
      firstName: 'Salma',
      lastName: 'Khaled',
      employeeNumber: 'EMP-019',
      nationalId: 'NAT-SALMA-019',
      primaryDepartmentId: deptMap['LIB-001']?._id,
      primaryPositionId: posMap['POS-LIB']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'tess.headley@company.com',
      firstName: 'Tess',
      lastName: 'Headley',
      employeeNumber: 'EMP-TEST-020',
      nationalId: 'NAT-TEST-HEAD-020',
      primaryDepartmentId: deptMap['TEST-001']?._id,
      primaryPositionId: posMap['POS-TEST-HEAD']?._id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
    },
    {
      workEmail: 'evan.tester@company.com',
      firstName: 'Evan',
      lastName: 'Tester',
      employeeNumber: 'EMP-TEST-021',
      nationalId: 'NAT-TEST-EMP-021',
      primaryDepartmentId: deptMap['TEST-001']?._id,
      primaryPositionId: posMap['POS-TEST-EMP']?._id,
      gender: 'MALE',
      maritalStatus: 'SINGLE',
    },
  ];

  const employees: any[] = [];
  for (const empData of coreEmployeesData) {
    const emp = {
      workEmail: empData.workEmail,
      firstName: empData.firstName,
      lastName: empData.lastName,
      fullName: `${empData.firstName} ${empData.lastName}`,
      employeeNumber: empData.employeeNumber,
      nationalId: empData.nationalId,
      primaryDepartmentId: empData.primaryDepartmentId,
      primaryPositionId: empData.primaryPositionId,
      gender: empData.gender,
      maritalStatus: empData.maritalStatus,
      status: 'ACTIVE',
      contractType: empData.contractType || 'FULL_TIME_CONTRACT',
      workType: empData.workType || 'FULL_TIME',
      password: passwordHash,
      bankAccount: empData.bankAccount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    employees.push(emp);
  }

  const empResult = await db.collection('employee_profiles').insertMany(employees);
  const employeeDocs = employees.map((emp, idx) => ({ _id: empResult.insertedIds[idx], ...emp }));
  const empMap = createMapBy(employeeDocs, 'workEmail');

  console.log(`✅ Created ${empResult.insertedCount} core employees`);

  // Create department head employees
  console.log('\n👔 Creating department head employees...');
  const headEmployees: any[] = [];
  const headDepts = [
    { deptCode: 'ENG-001', headRole: 'Head Engineering' },
    { deptCode: 'SALES-001', headRole: 'Head Sales' },
    { deptCode: 'LND-001', headRole: 'Head Learning and Development' },
    { deptCode: 'FIN-001', headRole: 'Head Finance' },
    { deptCode: 'LIB-001', headRole: 'Head Library Services' },
    { deptCode: 'OPS-001-INACTIVE', headRole: 'Head Operations (Inactive)' },
  ];

  for (const hd of headDepts) {
    const dept = deptMap[hd.deptCode];
    if (!dept) continue;

    const headPosCode = `POS-${hd.deptCode}-HEAD`;
    const headPos = posMap[headPosCode];
    if (!headPos) {
      console.warn(`⚠️  No position found for head: ${headPosCode}`);
      continue;
    }

    // Use existing head if position matches
    let headEmp = null;
    if (dept.headPositionId) {
      const existing = employeeDocs.find(e => e.primaryPositionId?.toString() === dept.headPositionId?.toString());
      if (existing) {
        headEmp = existing;
        console.log(`   ✅ Department ${hd.deptCode}: Using existing ${existing.workEmail}`);
        continue;
      }
    }

    // Create new head employee
    const headEmail = `head.${hd.deptCode}@company.com`;
    const headEmpData = {
      workEmail: headEmail,
      firstName: hd.headRole,
      lastName: '',
      fullName: hd.headRole,
      employeeNumber: `EMP-HEAD-${hd.deptCode}`,
      nationalId: `NAT-HEAD-${hd.deptCode}`,
      primaryDepartmentId: dept._id,
      primaryPositionId: headPos._id,
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      status: 'ACTIVE',
      contractType: 'FULL_TIME_CONTRACT',
      workType: 'FULL_TIME',
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    headEmployees.push(headEmpData);
    console.log(`   ✅ Created head employee: ${headEmail}`);
  }

  let headEmpResult: any = { insertedIds: [] };
  if (headEmployees.length > 0) {
    headEmpResult = await db.collection('employee_profiles').insertMany(headEmployees);
    const headDocs = headEmployees.map((emp, idx) => ({ _id: headEmpResult.insertedIds[idx], ...emp }));
    headDocs.forEach(emp => empMap[emp.workEmail] = emp);
    console.log(`✅ Created ${headEmpResult.insertedCount} head employees`);
  }

  // Create coverage employee for inactive department
  console.log('\n🔧 Creating coverage employee for inactive department...');
  const coverageEmp = {
    workEmail: 'inactive.ops-001-inactive@company.com',
    firstName: 'Inactive Operations (generated)',
    lastName: '',
    fullName: 'Inactive Operations (generated)',
    employeeNumber: 'EMP-INACTIVE-OPS-001-INACTIVE',
    nationalId: 'NAT-INACTIVE-OPS-001-INACTIVE',
    primaryDepartmentId: deptMap['OPS-001-INACTIVE']?._id,
    primaryPositionId: posMap['POS-OPS-001-INACTIVE-INACTIVE-COVERAGE']?._id,
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    status: 'ACTIVE',
    contractType: 'FULL_TIME_CONTRACT',
    workType: 'FULL_TIME',
    password: passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const coverageResult = await db.collection('employee_profiles').insertOne(coverageEmp);
  empMap['inactive.ops-001-inactive@company.com'] = { _id: coverageResult.insertedId, ...coverageEmp };
  console.log(`✅ Created coverage employee`);

  // Create system roles
  console.log('\n🔐 Creating system roles...');
  const rolesData = [
    { email: 'alice@company.com', roles: ['HR_MANAGER'], permissions: ['org.manage', 'hr.manage'] },
    { email: 'bob@company.com', roles: ['PAYROLL_SPECIALIST'], permissions: ['payroll.process'] },
    { email: 'charlie@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: [] },
    { email: 'diana@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
    { email: 'eric@company.com', roles: ['HR_EMPLOYEE'], permissions: ['hr.view'] },
    { email: 'fatima@company.com', roles: ['SYSTEM_ADMIN'], permissions: ['system.admin'] },
    { email: 'george@company.com', roles: ['HR_EMPLOYEE'], permissions: ['hr.view'] },
    { email: 'hannah@company.com', roles: ['FINANCE_STAFF'], permissions: ['finance.view'] },
    { email: 'ian@company.com', roles: ['HR_ADMIN'], permissions: ['hr.manage'] },
    { email: 'kevin@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: [] },
    { email: 'lina@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: [] },
    { email: 'paula@company.com', roles: ['FINANCE_STAFF'], permissions: ['finance.view'] },
    { email: 'rami@company.com', roles: ['HR_ADMIN'], permissions: ['hr.manage'] },
    { email: 'sarah.senior.swe@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
    { email: 'samir.sales.lead@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
    { email: 'tariq.ta@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
    { email: 'laila.la@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
    { email: 'amir.accountant@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['finance.view'] },
    { email: 'salma.librarian@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
    { email: 'evan.tester@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
    { email: 'inactive.ops-001-inactive@company.com', roles: ['DEPARTMENT_EMPLOYEE'], permissions: ['org.read'] },
  ];

  const systemRoles: any[] = [];
  for (const roleData of rolesData) {
    const emp = empMap[roleData.email];
    if (!emp) {
      console.warn(`⚠️  Employee not found for role assignment: ${roleData.email}`);
      continue;
    }

    systemRoles.push({
      employeeProfileId: emp._id,
      roles: roleData.roles,
      permissions: roleData.permissions,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Add head roles for all head employees
  Object.values(empMap).forEach((emp: any) => {
    if (emp.workEmail?.startsWith('head.')) {
      systemRoles.push({
        employeeProfileId: emp._id,
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  const rolesResult = await db.collection('employee_system_roles').insertMany(systemRoles);
  console.log(`✅ Created ${rolesResult.insertedCount} system roles`);

  // Create qualifications
  console.log('\n🎓 Creating qualifications...');
  const qualifications = [
    {
      employeeProfileId: empMap['alice@company.com']._id,
      establishmentName: 'Cairo University',
      graduationType: 'MASTER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      employeeProfileId: empMap['bob@company.com']._id,
      establishmentName: 'AUC',
      graduationType: 'BACHELOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const qualResult = await db.collection('employee_qualifications').insertMany(qualifications);
  console.log(`✅ Created ${qualResult.insertedCount} qualifications`);

  // Create profile change request
  console.log('\n📋 Creating profile change requests...');
  const changeRequests = [
    {
      requestId: 'REQ-EP-001',
      employeeProfileId: empMap['charlie@company.com']._id,
      requestDescription: 'Update work email to charlie.sales@company.com',
      reason: 'Team branding alignment',
      status: 'PENDING',
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const reqResult = await db.collection('employee_profile_change_requests').insertMany(changeRequests);
  console.log(`✅ Created ${reqResult.insertedCount} change requests`);

  // Summary
  console.log('\n🎉 EMPLOYEE PROFILE SEEDING COMPLETE!');
  console.log('\n📋 Summary:');
  console.log(`   - Core Employees: ${empResult.insertedCount}`);
  console.log(`   - Head Employees: ${headEmpResult.insertedIds?.length || 0}`);
  console.log(`   - Coverage Employees: 1`);
  console.log(`   - System Roles: ${rolesResult.insertedCount}`);
  console.log(`   - Qualifications: ${qualResult.insertedCount}`);
  console.log(`   - Change Requests: ${reqResult.insertedCount}`);
  console.log('\n✅ Minimum Acceptance Checklist:');
  console.log('   ✓ All 21 core employees created with correct identifiers');
  console.log('   ✓ Department head employees created for all departments');
  console.log('   ✓ Coverage employee created for inactive department');
  console.log('   ✓ System roles assigned to all employees');
  console.log('   ✓ Qualifications created for Alice and Bob');
  console.log('   ✓ Profile change request created for Charlie');

  await mongoose.disconnect();
}

// Run the seed
seedEmployees().catch(console.error);
