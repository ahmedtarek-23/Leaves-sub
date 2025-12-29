const mongoose = require('mongoose');

async function addMissingEntitlements() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr-system');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get all employees, leave types
    const employees = await db.collection('employee_profiles').find({}).toArray();
    const leaveTypes = await db.collection('leavetypes').find({}).toArray();
    const existingEntitlements = await db.collection('leaveentitlements').find({}).toArray();
    
    console.log(`📊 Found ${employees.length} employees and ${leaveTypes.length} leave types\n`);
    
    // Create a map of existing entitlements
    const existingMap = new Set();
    existingEntitlements.forEach(e => {
      existingMap.add(`${e.employeeId}_${e.leaveTypeId}`);
    });
    
    // Get AL and SL types
    const alType = leaveTypes.find(t => t.code === 'AL');
    const slType = leaveTypes.find(t => t.code === 'SL');
    
    console.log(`AL Type ID: ${alType._id}`);
    console.log(`SL Type ID: ${slType._id}\n`);
    
    // Create missing entitlements
    const newEntitlements = [];
    
    for (const emp of employees) {
      // Add AL entitlement if missing
      if (!existingMap.has(`${emp._id}_${alType._id}`)) {
        newEntitlements.push({
          employeeId: emp._id,
          leaveTypeId: alType._id,
          yearlyEntitlement: 21,
          accruedActual: 21,
          accruedRounded: 21,
          remaining: 21,
          taken: 0,
          pending: 0,
          carryForward: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      // Add SL entitlement if missing
      if (!existingMap.has(`${emp._id}_${slType._id}`)) {
        newEntitlements.push({
          employeeId: emp._id,
          leaveTypeId: slType._id,
          yearlyEntitlement: 14,
          accruedActual: 14,
          accruedRounded: 14,
          remaining: 14,
          taken: 0,
          pending: 0,
          carryForward: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    
    if (newEntitlements.length > 0) {
      const result = await db.collection('leaveentitlements').insertMany(newEntitlements);
      console.log(`✅ Added ${result.insertedCount} missing entitlements`);
    } else {
      console.log('✅ All employees already have AL and SL entitlements');
    }
    
    // Verify Salma now has entitlements
    const salma = await db.collection('employee_profiles').findOne({ workEmail: 'salma.librarian@company.com' });
    if (salma) {
      const salmaEnts = await db.collection('leaveentitlements').find({ employeeId: salma._id }).toArray();
      console.log(`\n👤 Salma's Entitlements: ${salmaEnts.length}`);
      salmaEnts.forEach(e => console.log(`  - Type: ${e.leaveTypeId}, Remaining: ${e.remaining}`));
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addMissingEntitlements();
