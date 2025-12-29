import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';

async function cleanup(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('🔗 Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // Drop indexes on positions collection
    await db.collection('positions').dropIndexes();
    console.log('✅ Dropped position indexes');
  } catch (e) {
    console.log('⚠️ No indexes to drop on positions');
  }

  try {
    // Drop the entire positions collection
    await db.collection('positions').drop();
    console.log('✅ Dropped positions collection');
  } catch (e) {
    console.log('⚠️ No positions collection to drop');
  }

  try {
    // Drop the entire departments collection
    await db.collection('departments').drop();
    console.log('✅ Dropped departments collection');
  } catch (e) {
    console.log('⚠️ No departments collection to drop');
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

cleanup().catch(console.error);
