import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

// Automatically load environment variables from .env.local or .env if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Connecting to Neon PostgreSQL via Prisma...');
  const startTime = Date.now();

  await prisma.$connect();
  console.log('✅ Connection established successfully.');

  const testTitle = `Test Course Verification ${Date.now()}`;
  const testDescription = 'Temporary verification record created by test-db.mjs';
  console.log(`📝 Inserting dummy record: "${testTitle}"...`);

  const createdCourse = await prisma.course.create({
    data: {
      title: testTitle,
      description: testDescription,
    },
  });

  console.log('✅ Record inserted successfully:', {
    id: createdCourse.id,
    title: createdCourse.title,
    createdAt: createdCourse.createdAt,
  });

  console.log('🔍 Reading record back from database...');
  const fetchedCourse = await prisma.course.findUnique({
    where: { id: createdCourse.id },
  });

  if (!fetchedCourse) {
    throw new Error('Database read verification failed: Record not found.');
  }

  if (
    fetchedCourse.id !== createdCourse.id ||
    fetchedCourse.title !== testTitle ||
    fetchedCourse.description !== testDescription
  ) {
    throw new Error(
      `Database read verification failed: Field mismatch. Expected title="${testTitle}", got="${fetchedCourse.title}"`
    );
  }

  console.log('✅ Record read successfully matched:', {
    id: fetchedCourse.id,
    title: fetchedCourse.title,
    description: fetchedCourse.description,
  });

  console.log('🧹 Cleaning up dummy test record...');
  await prisma.course.delete({
    where: { id: createdCourse.id },
  });

  // Verify deletion
  const deletedCheck = await prisma.course.findUnique({
    where: { id: createdCourse.id },
  });

  if (deletedCheck !== null) {
    throw new Error('Database cleanup verification failed: Record still exists.');
  }

  console.log('✅ Test record removed and cleanup verified.');

  const durationMs = Date.now() - startTime;
  console.log(`🎉 Neon DB & Prisma verification succeeded in ${durationMs}ms!`);
}

main()
  .catch((error) => {
    console.error('❌ Neon DB connection verification failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
