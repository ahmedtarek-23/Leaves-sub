import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';

async function checkLeaves(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  const categories = await db.collection('leave_categories').countDocuments();
  const types = await db.collection('leave_types').countDocuments();
  const policies = await db.collection('leave_policies').countDocuments();
  const entitlements = await db.collection('leave_entitlements').countDocuments();
  const requests = await db.collection('leave_requests').countDocuments();

  console.log('\n📊 Leave Collections Count:');
  console.log(`Leave Categories: ${categories}`);
  console.log(`Leave Types: ${types}`);
  console.log(`Leave Policies: ${policies}`);
  console.log(`Leave Entitlements: ${entitlements}`);
  console.log(`Leave Requests: ${requests}`);

  if (types > 0) {
    const typeSample = await db.collection('leave_types').findOne({});
    console.log('\nSample Leave Type:', typeSample);
  }

  await mongoose.disconnect();
}

checkLeaves().catch(console.error);
