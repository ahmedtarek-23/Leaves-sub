const mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/hr-system';

mongoose.connect(uri).then(async () => {
  const empColl = mongoose.connection.collection('employees');
  
  // List all employees first
  const allEmps = await empColl.find({}).toArray();
  console.log('All Employees:');
  allEmps.forEach(e => console.log(`  - ${e.firstName} ${e.lastName} (${e.email})`));
  
  const emp = await empColl.findOne({ email: 'alice@company.com' });
  
  if (!emp) {
    console.log('\nAlice not found, trying first employee...');
    const first = allEmps[0];
    console.log(`Using ${first.firstName} ${first.lastName}`);
  }
  
  console.log('Alice ID:', emp._id);
  
  const ltColl = mongoose.connection.collection('leavetypes');
  const types = await ltColl.find({}).toArray();
  console.log('\nLeave Types:');
  types.forEach(t => console.log(`  - ${t._id}: ${t.name}`));
  
  const entColl = mongoose.connection.collection('leaveentitlements');
  const ents = await entColl.find({ employeeId: emp._id.toString() }).toArray();
  
  console.log(`\nAlice's Entitlements (${ents.length}):`);
  ents.forEach(e => {
    const type = types.find(t => t._id.toString() === e.leaveTypeId.toString());
    console.log(`  - Type: ${type?.name} (${e.leaveTypeId}), Remaining: ${e.remaining}`);
  });
  
  mongoose.disconnect();
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
