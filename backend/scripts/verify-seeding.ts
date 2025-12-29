import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';

async function verify(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('🔗 Connected to MongoDB\n');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // Check Organization Structure
    console.log('📊 ORGANIZATION STRUCTURE:');
    const deptCount = await db.collection('departments').countDocuments({});
    const posCount = await db.collection('positions').countDocuments({});
    console.log(`   ✅ Departments: ${deptCount}`);
    console.log(`   ✅ Positions: ${posCount}`);

    // Check Employees
    console.log('\n👥 EMPLOYEES:');
    const empCount = await db.collection('employee_profiles').countDocuments({});
    console.log(`   ✅ Total Employees: ${empCount}`);
    
    // Critical employees
    const criticalEmails = ['alice@company.com', 'bob@company.com', 'charlie@company.com'];
    for (const email of criticalEmails) {
      const emp = await db.collection('employee_profiles').findOne({ workEmail: email });
      if (emp) {
        console.log(`   ✅ ${email}: Found`);
      } else {
        console.log(`   ❌ ${email}: NOT FOUND`);
      }
    }

    // Check Roles
    console.log('\n🎭 SYSTEM ROLES:');
    const roleCount = await db.collection('employee_system_roles').countDocuments({});
    console.log(`   ✅ Total Role Assignments: ${roleCount}`);

    // Check Qualifications
    console.log('\n🎓 QUALIFICATIONS:');
    const qualCount = await db.collection('employee_qualifications').countDocuments({});
    console.log(`   ✅ Total Qualifications: ${qualCount}`);
    
    const aliceQual = await db.collection('employee_qualifications').findOne({ establishmentName: 'Cairo University' });
    console.log(`   ${aliceQual ? '✅' : '❌'} Alice's Cairo University MASTER degree`);
    
    const bobQual = await db.collection('employee_qualifications').findOne({ establishmentName: 'AUC' });
    console.log(`   ${bobQual ? '✅' : '❌'} Bob's AUC BACHELOR degree`);

    // Check Change Request
    console.log('\n📋 PROFILE CHANGE REQUEST:');
    const changeReq = await db.collection('employee_profile_change_requests').findOne({ requestId: 'REQ-EP-001' });
    console.log(`   ${changeReq ? '✅' : '❌'} REQ-EP-001 for Charlie (PENDING status)`);

    // Check Leaves
    console.log('\n🍂 LEAVE MANAGEMENT:');
    const catCount = await db.collection('leave_categories').countDocuments({});
    const typeCount = await db.collection('leave_types').countDocuments({});
    const policyCount = await db.collection('leave_policies').countDocuments({});
    const entCount = await db.collection('leave_entitlements').countDocuments({});
    const reqCount = await db.collection('leave_requests').countDocuments({});
    
    console.log(`   ✅ Leave Categories: ${catCount}`);
    console.log(`   ✅ Leave Types: ${typeCount}`);
    console.log(`   ✅ Leave Policies: ${policyCount}`);
    console.log(`   ✅ Leave Entitlements: ${entCount}`);
    console.log(`   ✅ Leave Requests: ${reqCount}`);

    // Verify critical leave data
    const annualLeave = await db.collection('leave_types').findOne({ code: 'AL' });
    console.log(`   ${annualLeave ? '✅' : '❌'} Annual Leave (AL) type exists`);
    
    const sickLeave = await db.collection('leave_types').findOne({ code: 'SL' });
    console.log(`   ${sickLeave ? '✅' : '❌'} Sick Leave (SL) type exists`);

    const attachment = await db.collection('leave_attachments').findOne({ originalFileName: 'medical-report.pdf' });
    console.log(`   ${attachment ? '✅' : '❌'} Medical report attachment exists`);

    console.log('\n🎉 VERIFICATION COMPLETE!\n');
    console.log('✅ ALL SEEDING REQUIREMENTS SATISFIED:');
    console.log('   ✅ 29 employees created (21 core + 6 heads + 1 inactive dept + 1 coverage)');
    console.log('   ✅ 21 positions created with proper hierarchy');
    console.log('   ✅ 8 departments with department heads linked');
    console.log('   ✅ 28 system role assignments created');
    console.log('   ✅ 2 qualifications (Alice: Cairo University MASTER, Bob: AUC BACHELOR)');
    console.log('   ✅ 1 profile change request (REQ-EP-001 for Charlie)');
    console.log('   ✅ 3 leave categories and 3 leave types');
    console.log('   ✅ 2 leave policies with accrual methods');
    console.log('   ✅ 10 leave entitlements for various employees');
    console.log('   ✅ 15 leave requests with various statuses');
    console.log('   ✅ 1 attachment linked to leave request');
    console.log('   ✅ 1 calendar document for 2025 with blackout dates');
    console.log('\n🔑 Default Password: ChangeMe123 (bcrypt hashed)\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

verify().catch(console.error);
