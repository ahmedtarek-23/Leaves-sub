const mongoose = require('mongoose');
require('dotenv').config();

const requiredEmails = [
  'alice@company.com',
  'bob@company.com', 
  'charlie@company.com',
  'tariq.ta@company.com',
  'laila.la@company.com',
  'amir.accountant@company.com',
  'salma.librarian@company.com'
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system');
    const db = mongoose.connection.db;
    
    console.log('\n👥 Verifying Required Employees:\n');
    
    let allGood = true;
    for (const email of requiredEmails) {
      const emp = await db.collection('employee_profiles').findOne({ workEmail: email });
      if (emp) {
        console.log(`✅ ${email}`);
        console.log(`   Name: ${emp.firstName} ${emp.lastName}`);
        console.log(`   Role: ${emp.systemRoles?.[0] || 'none'}`);
        
        // Check entitlements
        const ents = await db.collection('leaveentitlements').find({ employeeId: emp._id }).toArray();
        console.log(`   Entitlements: ${ents.length} types`);
        ents.forEach(e => {
          const remaining = e.remaining || 0;
          const type = e.leaveTypeId ? e.leaveTypeId.toString() : 'unknown';
          console.log(`     - ${type}: ${remaining} days remaining`);
        });
      } else {
        console.log(`❌ ${email}: NOT FOUND`);
        allGood = false;
      }
      console.log('');
    }
    
    console.log('\n📊 Summary:');
    const allEmps = await db.collection('employee_profiles').find({}).toArray();
    const allEnts = await db.collection('leaveentitlements').find({}).toArray();
    console.log(`Total employees in system: ${allEmps.length}`);
    console.log(`Total entitlements: ${allEnts.length}`);
    
    if (allGood) {
      console.log('\n✅ All required employees verified and working!\n');
    } else {
      console.log('\n⚠️  Some employees are missing!\n');
    }
    
    await mongoose.disconnect();
    process.exit(allGood ? 0 : 1);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
