const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr-system');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    const types = await db.collection('leavetypes').find({}).toArray();
    const ents = await db.collection('leaveentitlements').find({}).toArray();
    const emps = await db.collection('employee_profiles').find({ workEmail: 'salma.librarian@company.com' }).toArray();
    
    console.log('📋 Leave Types:');
    types.forEach(t => console.log(`  - ${t.name} (${t.code}): ID = ${t._id}`));
    
    console.log('\n👤 Salma Employee:');
    if (emps.length > 0) {
      console.log(`  ID: ${emps[0]._id}`);
      console.log(`  Email: ${emps[0].workEmail}`);
    }
    
    console.log('\n💰 Entitlements:');
    ents.slice(0, 5).forEach(e => {
      console.log(`  - Employee: ${e.employeeId}, Type: ${e.leaveTypeId}, Balance: ${e.remaining}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
