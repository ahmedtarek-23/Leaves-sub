const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr-system');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📋 All Collections in MongoDB:');
    collections.forEach(c => {
      console.log('  - ' + c.name);
    });

    // Check specific collections
    console.log('\n🍂 Leave-related collections:');
    const leaveCollections = collections.filter(c => c.name.toLowerCase().includes('leave'));
    if (leaveCollections.length === 0) {
      console.log('  (none found)');
    } else {
      leaveCollections.forEach(c => console.log('  - ' + c.name));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
