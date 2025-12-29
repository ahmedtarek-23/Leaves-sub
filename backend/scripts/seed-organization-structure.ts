import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';

/* ================================================================ */
/* Main Seeding Function                                            */
/* ================================================================ */
async function seedOrganizationStructure(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('🔗 Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  // Clean slate
  console.log('\n🧹 Clearing existing organization data...');
  await db.collection('departments').deleteMany({});
  await db.collection('positions').deleteMany({});
  console.log('✅ Cleared existing organization data');

  // Create Positions first (they don't depend on departments)
  console.log('\n📌 Creating positions...');
  const positions = [
    // HR Positions
    { posCode: 'POS-HR-MGR', name: 'HR Manager', department: 'HR', level: 'SENIOR' },
    { posCode: 'POS-HR-GEN', name: 'HR Generalist', department: 'HR', level: 'MID' },
    
    // Finance Positions
    { posCode: 'POS-ACC', name: 'Accountant', department: 'Finance', level: 'MID' },
    
    // Sales Positions
    { posCode: 'POS-SALES-REP', name: 'Sales Representative', department: 'Sales', level: 'JUNIOR' },
    { posCode: 'POS-SALES-LEAD', name: 'Sales Lead', department: 'Sales', level: 'MID' },
    
    // Engineering Positions
    { posCode: 'POS-SWE', name: 'Software Engineer', department: 'Engineering', level: 'JUNIOR' },
    { posCode: 'POS-SENIOR-SWE', name: 'Senior Software Engineer', department: 'Engineering', level: 'SENIOR' },
    { posCode: 'POS-QA-ENG', name: 'QA Engineer', department: 'Engineering', level: 'MID' },
    
    // Learning & Development Positions
    { posCode: 'POS-TA', name: 'Training Associate', department: 'Learning & Development', level: 'JUNIOR' },
    { posCode: 'POS-LA', name: 'Learning Associate', department: 'Learning & Development', level: 'JUNIOR' },
    
    // Library Positions
    { posCode: 'POS-LIB', name: 'Librarian', department: 'Library Services', level: 'MID' },
    
    // Operations Positions (Inactive)
    { posCode: 'POS-OPS-INACTIVE', name: 'Operations Coverage', department: 'Operations', level: 'JUNIOR' },
    { posCode: 'POS-OPS-001-INACTIVE-HEAD', name: 'Operations Head', department: 'Operations', level: 'SENIOR' },
    
    // Test Positions
    { posCode: 'POS-TEST-HEAD', name: 'Test Department Head', department: 'Test', level: 'SENIOR' },
    { posCode: 'POS-TEST-EMP', name: 'Test Employee', department: 'Test', level: 'JUNIOR' },
    
    // Department Head Positions
    { posCode: 'POS-ENG-001-HEAD', name: 'Engineering Head', department: 'Engineering', level: 'SENIOR', isDepartmentHead: true },
    { posCode: 'POS-SALES-001-HEAD', name: 'Sales Head', department: 'Sales', level: 'SENIOR', isDepartmentHead: true },
    { posCode: 'POS-LND-001-HEAD', name: 'L&D Head', department: 'Learning & Development', level: 'SENIOR', isDepartmentHead: true },
    { posCode: 'POS-FIN-001-HEAD', name: 'Finance Head', department: 'Finance', level: 'SENIOR', isDepartmentHead: true },
    { posCode: 'POS-LIB-001-HEAD', name: 'Library Head', department: 'Library Services', level: 'SENIOR', isDepartmentHead: true },
    { posCode: 'POS-HR-001-HEAD', name: 'HR Head', department: 'HR', level: 'SENIOR', isDepartmentHead: true },
  ];

  const posResult = await db.collection('positions').insertMany(
    positions.map(pos => ({
      ...pos,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  const posDocs = positions.map((pos, idx) => ({
    _id: posResult.insertedIds[idx],
    ...pos,
  }));

  console.log(`✅ Created ${posResult.insertedCount} positions`);

  // Create departments
  console.log('\n🏢 Creating departments...');
  const departments = [
    {
      deptCode: 'HR-001',
      name: 'Human Resources',
      description: 'HR and People Operations',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-HR-001-HEAD')?._id,
      isActive: true,
    },
    {
      deptCode: 'FIN-001',
      name: 'Finance',
      description: 'Financial Operations',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-FIN-001-HEAD')?._id,
      isActive: true,
    },
    {
      deptCode: 'SALES-001',
      name: 'Sales',
      description: 'Sales and Business Development',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-SALES-001-HEAD')?._id,
      isActive: true,
    },
    {
      deptCode: 'ENG-001',
      name: 'Engineering',
      description: 'Software Engineering',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-ENG-001-HEAD')?._id,
      isActive: true,
    },
    {
      deptCode: 'LND-001',
      name: 'Learning & Development',
      description: 'Training and Development',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-LND-001-HEAD')?._id,
      isActive: true,
    },
    {
      deptCode: 'LIB-001',
      name: 'Library Services',
      description: 'Library and Information Services',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-LIB-001-HEAD')?._id,
      isActive: true,
    },
    {
      deptCode: 'OPS-001-INACTIVE',
      name: 'Operations (Inactive)',
      description: 'Inactive Operations Department',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-OPS-001-INACTIVE-HEAD')?._id,
      isActive: false,
    },
    {
      deptCode: 'TEST-001',
      name: 'Test Department',
      description: 'Testing Department',
      parentDepartmentId: null,
      headPositionId: posDocs.find(p => p.posCode === 'POS-TEST-HEAD')?._id,
      isActive: true,
    },
  ];

  const deptResult = await db.collection('departments').insertMany(
    departments.map(dept => ({
      ...dept,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  console.log(`✅ Created ${deptResult.insertedCount} departments`);

  // Summary
  console.log('\n🎉 ORGANIZATION STRUCTURE SEEDING COMPLETE!');
  console.log('\n📋 Summary:');
  console.log(`   - Positions: ${posResult.insertedCount}`);
  console.log(`   - Departments: ${deptResult.insertedCount}`);
  console.log('\n✅ You can now run: npx ts-node -T scripts/seed-employees.ts');

  await mongoose.disconnect();
}

// Run the seed
seedOrganizationStructure().catch(console.error);
