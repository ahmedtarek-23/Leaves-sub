import 'dotenv/config';
import mongoose from 'mongoose';

// Use a different variable name to avoid conflicts
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';

/* ------------------------------------------------------------------ */
/* 1.  Helper Functions                                               */
/* ------------------------------------------------------------------ */
function createMapBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T> {
  return Object.fromEntries(arr.map(i => [i[key], i]));
}

function getNextWeekDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

function getNextWeekPlusTwoDays(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 9);
  return date;
}

function getTodayDate(): Date {
  return new Date();
}

function getNextWeek(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

/* ------------------------------------------------------------------ */
/* 2.  Main Seed Function                                             */
/* ------------------------------------------------------------------ */
async function seedLeaves(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('🔗 Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  // Get existing employees from the CORRECT collection name
  console.log('\n🔍 Looking for employees in employee_profiles collection...');
  const employeeDocs = await db.collection('employee_profiles').find({}).toArray();
  const employeeMap = createMapBy(employeeDocs, 'workEmail');
  
  console.log(`📊 Found ${employeeDocs.length} employees`);
  
  if (employeeDocs.length === 0) {
    console.error('❌ No employees found in employee_profiles collection!');
    console.error('   Please seed employees first with: npx ts-node -T scripts/seed-employees-final.ts');
    await mongoose.disconnect();
    return;
  }

  // Verify we have the required employees
  console.log('\n👥 Verifying required employees:');
  const requiredEmails = [
    'alice@company.com',
    'bob@company.com', 
    'charlie@company.com',
    'tariq.ta@company.com',
    'laila.la@company.com',
    'amir.accountant@company.com',
    'salma.librarian@company.com'
  ];
  
  let missingEmails: string[] = [];
  requiredEmails.forEach(email => {
    if (employeeMap[email]) {
      console.log(`   ✅ ${email}: Found`);
    } else {
      console.log(`   ❌ ${email}: MISSING`);
      missingEmails.push(email);
    }
  });
  
  if (missingEmails.length > 0) {
    console.error(`\n⚠️  Missing ${missingEmails.length} required employees.`);
    console.error('   Please re-seed employees before continuing.');
    await mongoose.disconnect();
    return;
  }

  // Clean slate for leave data
  console.log('\n🧹 Clearing existing leave data...');
  await db.collection('leaveadjustments').deleteMany({});
  await db.collection('calendars').deleteMany({});
  await db.collection('leaverequests').deleteMany({});
  await db.collection('leaveentitlements').deleteMany({});
  await db.collection('leavepolicies').deleteMany({});
  await db.collection('leavetypes').deleteMany({});
  await db.collection('leavecategories').deleteMany({});
  await db.collection('attachments').deleteMany({});
  console.log('✅ Cleared existing leave data');

  // 1. Create Leave Categories
  console.log('\n📂 Creating leave categories...');
  const leaveCategories = [
    { name: 'Annual', description: 'Standard annual leave', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Sick', description: 'Medical leave', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Unpaid', description: 'Unpaid leave category', createdAt: new Date(), updatedAt: new Date() },
  ];

  const categoryResult = await db.collection('leavecategories').insertMany(leaveCategories);
  const categoryDocs = leaveCategories.map((cat, index) => ({
    _id: categoryResult.insertedIds[index],
    ...cat
  }));
  console.log(`✅ Created ${categoryDocs.length} leave categories`);
  
  const categoryMap = createMapBy(categoryDocs, 'name');

  // 2. Create Leave Types
  console.log('\n🏷️ Creating leave types...');
  const leaveTypes = [
    {
      code: 'AL',
      name: 'Annual Leave',
      categoryId: categoryMap['Annual']._id,
      description: 'Paid annual leave',
      paid: true,
      deductible: true,
      requiresAttachment: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: 'SL',
      name: 'Sick Leave',
      categoryId: categoryMap['Sick']._id,
      description: 'Paid sick leave',
      paid: true,
      deductible: true,
      requiresAttachment: true,
      attachmentType: 'medical',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: 'UL',
      name: 'Unpaid Leave',
      categoryId: categoryMap['Unpaid']._id,
      description: 'Unpaid leave type',
      paid: false,
      deductible: false,
      requiresAttachment: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const leaveTypeResult = await db.collection('leavetypes').insertMany(leaveTypes);
  const leaveTypeDocs = leaveTypes.map((type, index) => ({
    _id: leaveTypeResult.insertedIds[index],
    ...type
  }));
  console.log(`✅ Created ${leaveTypeDocs.length} leave types`);
  
  const leaveTypeMap = createMapBy(leaveTypeDocs, 'code');

  // 3. Create Leave Policies
  console.log('\n📜 Creating leave policies...');
  const leavePolicies = [
    {
      leaveTypeId: leaveTypeMap['AL']._id,
      accrualMethod: 'MONTHLY',
      monthlyRate: 1.75,
      yearlyRate: 21,
      carryForwardAllowed: true,
      maxCarryForward: 5,
      roundingRule: 'ROUND_UP',
      minNoticeDays: 7,
      eligibility: { minTenureMonths: 6 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      leaveTypeId: leaveTypeMap['SL']._id,
      accrualMethod: 'YEARLY',
      monthlyRate: 0,
      yearlyRate: 14,
      carryForwardAllowed: false,
      maxCarryForward: 0,
      roundingRule: 'NONE',
      minNoticeDays: 0,
      eligibility: { none: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection('leavepolicies').insertMany(leavePolicies);
  console.log(`✅ Created ${leavePolicies.length} leave policies`);

  // 4. Create Leave Entitlements
  console.log('\n💰 Creating leave entitlements...');
  const entitlementsData = [
    // Alice
    { email: 'alice@company.com', leaveTypeCode: 'AL', yearlyEntitlement: 21, accruedActual: 21, accruedRounded: 21, remaining: 21 },
    { email: 'alice@company.com', leaveTypeCode: 'SL', yearlyEntitlement: 14, accruedActual: 14, accruedRounded: 14, remaining: 14 },
    // Bob
    { email: 'bob@company.com', leaveTypeCode: 'AL', yearlyEntitlement: 21, accruedActual: 21, accruedRounded: 21, remaining: 21 },
    { email: 'bob@company.com', leaveTypeCode: 'SL', yearlyEntitlement: 14, accruedActual: 14, accruedRounded: 14, remaining: 14 },
    // Charlie
    { email: 'charlie@company.com', leaveTypeCode: 'AL', yearlyEntitlement: 21, accruedActual: 21, accruedRounded: 21, remaining: 21 },
    { email: 'charlie@company.com', leaveTypeCode: 'SL', yearlyEntitlement: 14, accruedActual: 14, accruedRounded: 14, remaining: 14 },
    // Tariq
    { email: 'tariq.ta@company.com', leaveTypeCode: 'AL', yearlyEntitlement: 21, accruedActual: 21, accruedRounded: 21, remaining: 21 },
    { email: 'tariq.ta@company.com', leaveTypeCode: 'SL', yearlyEntitlement: 14, accruedActual: 14, accruedRounded: 14, remaining: 14 },
    // Laila
    { email: 'laila.la@company.com', leaveTypeCode: 'AL', yearlyEntitlement: 21, accruedActual: 21, accruedRounded: 21, remaining: 21 },
    { email: 'laila.la@company.com', leaveTypeCode: 'SL', yearlyEntitlement: 14, accruedActual: 14, accruedRounded: 14, remaining: 14 },
    // Amir
    { email: 'amir.accountant@company.com', leaveTypeCode: 'AL', yearlyEntitlement: 21, accruedActual: 21, accruedRounded: 21, remaining: 21 },
    { email: 'amir.accountant@company.com', leaveTypeCode: 'SL', yearlyEntitlement: 14, accruedActual: 14, accruedRounded: 14, remaining: 14 },
    // Salma - Give her AL and SL too
    { email: 'salma.librarian@company.com', leaveTypeCode: 'AL', yearlyEntitlement: 21, accruedActual: 21, accruedRounded: 21, remaining: 21 },
    { email: 'salma.librarian@company.com', leaveTypeCode: 'SL', yearlyEntitlement: 14, accruedActual: 14, accruedRounded: 14, remaining: 14 },
    { email: 'salma.librarian@company.com', leaveTypeCode: 'UL', yearlyEntitlement: 0, accruedActual: 0, accruedRounded: 0, remaining: 0 },
  ];

  const entitlements: any[] = [];
  for (const ent of entitlementsData) {
    const employee = employeeMap[ent.email];
    if (!employee) {
      console.warn(`⚠️  Employee not found for entitlement: ${ent.email}`);
      continue;
    }

    entitlements.push({
      employeeId: employee._id,
      leaveTypeId: leaveTypeMap[ent.leaveTypeCode]._id,
      yearlyEntitlement: ent.yearlyEntitlement,
      accruedActual: ent.accruedActual,
      accruedRounded: ent.accruedRounded,
      remaining: ent.remaining,
      taken: 0,
      pending: 0,
      carryForward: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const entitlementResult = await db.collection('leaveentitlements').insertMany(entitlements);
  console.log(`✅ Created ${entitlementResult.insertedCount} leave entitlements`);

  // 5. Create Attachments
  console.log('\n📎 Creating attachments...');
  const attachmentResult = await db.collection('attachments').insertOne({
    originalName: 'medical-report.pdf',
    filePath: '/attachments/medical-report.pdf',
    fileType: 'application/pdf',
    size: 350000,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const attachmentId = attachmentResult.insertedId;
  console.log(`✅ Created attachment: medical-report.pdf`);

  // 6. Create Calendar
  console.log('\n📅 Creating calendar...');
  const currentYear = new Date().getFullYear();
  await db.collection('calendars').insertOne({
    year: currentYear,
    holidays: [],
    blockedPeriods: [
      {
        from: new Date(`${currentYear}-08-01`),
        to: new Date(`${currentYear}-08-15`),
        reason: 'Peak season blackout',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`✅ Created calendar for year ${currentYear}`);

  // 7. Create Leave Requests
  console.log('\n📝 Creating leave requests...');
  
  const leaveRequestsData = [
    // Alice - PENDING
    {
      email: 'alice@company.com',
      leaveTypeCode: 'AL',
      dates: { from: getNextWeekDate(), to: getNextWeekPlusTwoDays() },
      durationDays: 3,
      justification: 'Vacation',
      status: 'PENDING',
      approvalFlow: [{ role: 'Manager', status: 'Pending' }],
    },
    // Bob - APPROVED
    {
      email: 'bob@company.com',
      leaveTypeCode: 'SL',
      dates: { from: getTodayDate(), to: getNextWeek() },
      durationDays: 7,
      justification: 'Medical leave',
      status: 'APPROVED',
      approvalFlow: [{ 
        role: 'HR', 
        status: 'Approved',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date(),
      }],
    },
    // Tariq - REJECTED (5 requests)
    {
      email: 'tariq.ta@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-05-01'), to: new Date('2025-05-02') },
      durationDays: 2,
      justification: 'Workshop support travel',
      status: 'REJECTED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Rejected',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-04-20'),
      }],
    },
    {
      email: 'tariq.ta@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-06-10'), to: new Date('2025-06-10') },
      durationDays: 1,
      justification: 'Training conflict',
      status: 'REJECTED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Rejected',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-06-05'),
      }],
    },
    {
      email: 'tariq.ta@company.com',
      leaveTypeCode: 'SL',
      dates: { from: new Date('2025-07-15'), to: new Date('2025-07-16') },
      durationDays: 2,
      justification: 'Medical checkup',
      status: 'REJECTED',
      approvalFlow: [{ 
        role: 'HR', 
        status: 'Rejected',
        decidedBy: employeeMap['bob@company.com']._id,
        decidedAt: new Date('2025-07-10'),
      }],
    },
    {
      email: 'tariq.ta@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-08-20'), to: new Date('2025-08-22') },
      durationDays: 3,
      justification: 'Family event',
      status: 'REJECTED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Rejected',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-08-15'),
      }],
    },
    {
      email: 'tariq.ta@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-09-05'), to: new Date('2025-09-06') },
      durationDays: 2,
      justification: 'Professional certification prep',
      status: 'APPROVED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Approved',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-08-30'),
      }],
    },
    // Laila - APPROVED (3 requests)
    {
      email: 'laila.la@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-05-12'), to: new Date('2025-05-13') },
      durationDays: 2,
      justification: 'Conference attendance',
      status: 'APPROVED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Approved',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-05-05'),
      }],
    },
    {
      email: 'laila.la@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-06-18'), to: new Date('2025-06-19') },
      durationDays: 2,
      justification: 'Family visit',
      status: 'APPROVED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Approved',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-06-10'),
      }],
    },
    {
      email: 'laila.la@company.com',
      leaveTypeCode: 'SL',
      dates: { from: new Date('2025-07-08'), to: new Date('2025-07-09') },
      durationDays: 2,
      justification: 'Dental procedure recovery',
      status: 'APPROVED',
      approvalFlow: [{ 
        role: 'HR', 
        status: 'Approved',
        decidedBy: employeeMap['bob@company.com']._id,
        decidedAt: new Date('2025-07-05'),
      }],
    },
    // Amir - Mixed status (4 requests)
    {
      email: 'amir.accountant@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-05-22'), to: new Date('2025-05-23') },
      durationDays: 2,
      justification: 'Quarter-end break',
      status: 'PENDING',
      approvalFlow: [{ role: 'Manager', status: 'Pending' }],
    },
    {
      email: 'amir.accountant@company.com',
      leaveTypeCode: 'SL',
      dates: { from: new Date('2025-06-02'), to: new Date('2025-06-02') },
      durationDays: 1,
      justification: 'Clinic visit',
      status: 'PENDING',
      approvalFlow: [{ role: 'HR', status: 'Pending' }],
    },
    {
      email: 'amir.accountant@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-07-20'), to: new Date('2025-07-22') },
      durationDays: 3,
      justification: 'Family vacation',
      status: 'APPROVED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Approved',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-07-10'),
      }],
    },
    {
      email: 'amir.accountant@company.com',
      leaveTypeCode: 'AL',
      dates: { from: new Date('2025-08-12'), to: new Date('2025-08-13') },
      durationDays: 2,
      justification: 'Audit support conflict',
      status: 'REJECTED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Rejected',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-08-05'),
      }],
    },
    // Salma - Unpaid APPROVED
    {
      email: 'salma.librarian@company.com',
      leaveTypeCode: 'UL',
      dates: { from: new Date('2025-09-15'), to: new Date('2025-09-17') },
      durationDays: 3,
      justification: 'Community event support (unpaid)',
      status: 'APPROVED',
      approvalFlow: [{ 
        role: 'Manager', 
        status: 'Approved',
        decidedBy: employeeMap['alice@company.com']._id,
        decidedAt: new Date('2025-09-05'),
      }],
    },
  ];

  const leaveRequests: any[] = [];
  for (const req of leaveRequestsData) {
    const employee = employeeMap[req.email];
    if (!employee) {
      console.warn(`⚠️  Employee not found for leave request: ${req.email}`);
      continue;
    }

    const requestData: any = {
      employeeId: employee._id,
      leaveTypeId: leaveTypeMap[req.leaveTypeCode]._id,
      dates: req.dates,
      durationDays: req.durationDays,
      justification: req.justification,
      status: req.status,
      approvalFlow: req.approvalFlow,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Link attachment to Bob's sick leave request
    if (req.email === 'bob@company.com' && req.leaveTypeCode === 'SL') {
      requestData.attachmentId = attachmentId;
    }

    leaveRequests.push(requestData);
  }

  const leaveRequestResult = await db.collection('leaverequests').insertMany(leaveRequests);
  console.log(`✅ Created ${leaveRequestResult.insertedCount} leave requests`);

  // 8. Create Leave Adjustment
  console.log('\n⚖️ Creating leave adjustment...');
  const charlie = employeeMap['charlie@company.com'];
  const alice = employeeMap['alice@company.com'];
  
  if (charlie && alice) {
    await db.collection('leaveadjustments').insertOne({
      employeeId: charlie._id,
      leaveTypeId: leaveTypeMap['AL']._id,
      adjustmentType: 'ADD',
      amount: 2,
      reason: 'Recognition award',
      hrUserId: alice._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Created leave adjustment for ${charlie.workEmail}`);
  } else {
    console.warn(`⚠️  Could not create leave adjustment - missing employees: ${!charlie ? 'Charlie' : ''} ${!alice ? 'Alice' : ''}`);
  }

  // Summary
  console.log('\n🎉 LEAVE MANAGEMENT SEEDING COMPLETE!');
  console.log('\n📋 Summary:');
  console.log(`   - Leave Categories: ${categoryDocs.length}`);
  console.log(`   - Leave Types: ${leaveTypeDocs.length}`);
  console.log(`   - Leave Policies: ${leavePolicies.length}`);
  console.log(`   - Leave Entitlements: ${entitlementResult.insertedCount}`);
  console.log(`   - Leave Requests: ${leaveRequestResult.insertedCount}`);
  console.log(`   - Attachments: 1`);
  console.log(`   - Calendar: 1`);
  console.log(`   - Leave Adjustments: ${charlie && alice ? '1' : '0'}`);
  console.log('\n✅ Minimum Acceptance Checklist:');
  console.log('   ✓ Three leave categories/types exist with exact codes and flags');
  console.log('   ✓ Two policies seeded with the stated accrual/eligibility values');
  console.log('   ✓ Entitlements for Alice for AL and SL exist with full accrual/remaining values');
  console.log('   ✓ Fifteen leave requests exist with statuses/approvals as listed');
  console.log('   ✓ Attachment medical-report.pdf exists and is linked to Bob\'s sick leave request');
  console.log('   ✓ Calendar document for current year exists with blackout period');
  console.log(`   ✓ LeaveAdjustment for Charlie ${charlie && alice ? 'exists (ADD 2 days)' : 'MISSING'}`);
  
  await mongoose.disconnect();
}

// Run the seed
seedLeaves().catch(console.error);
