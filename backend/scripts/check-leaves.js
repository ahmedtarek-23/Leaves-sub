const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr-system');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const cats = await db.collection('leave_categories').countDocuments();
    const types = await db.collection('leave_types').countDocuments();
    const policies = await db.collection('leave_policies').countDocuments();
    const ents = await db.collection('leave_entitlements').countDocuments();
    const reqs = await db.collection('leave_requests').countDocuments();
    const atts = await db.collection('leave_attachments').countDocuments();

    console.log('Leave Categories:', cats);
    console.log('Leave Types:', types);
    console.log('Leave Policies:', policies);
    console.log('Leave Entitlements:', ents);
    console.log('Leave Requests:', reqs);
    console.log('Leave Attachments:', atts);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
