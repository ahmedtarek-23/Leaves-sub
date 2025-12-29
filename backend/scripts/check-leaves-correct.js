const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr-system');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    const cats = await db.collection('leavecategories').countDocuments();
    const types = await db.collection('leavetypes').countDocuments();
    const policies = await db.collection('leavepolicies').countDocuments();
    const ents = await db.collection('leaveentitlements').countDocuments();
    const reqs = await db.collection('leaverequests').countDocuments();
    const atts = await db.collection('attachments').countDocuments();
    const cal = await db.collection('calendars').countDocuments();
    const adj = await db.collection('leaveadjustments').countDocuments();

    console.log('🍂 LEAVE DATA COUNTS:');
    console.log(`   Leave Categories: ${cats}`);
    console.log(`   Leave Types: ${types}`);
    console.log(`   Leave Policies: ${policies}`);
    console.log(`   Leave Entitlements: ${ents}`);
    console.log(`   Leave Requests: ${reqs}`);
    console.log(`   Attachments: ${atts}`);
    console.log(`   Calendars: ${cal}`);
    console.log(`   Leave Adjustments: ${adj}`);

    if (cats > 0) {
      const category = await db.collection('leavecategories').findOne({});
      console.log('\n📝 Sample Leave Category:');
      console.log(JSON.stringify(category, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
