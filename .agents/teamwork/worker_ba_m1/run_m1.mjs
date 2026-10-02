import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const projectRoot = path.resolve('d:/VS CODE/learn-quran-academy');
const envPath = path.join(projectRoot, '.env.local');

console.log('=== Milestone 1 Execution Script ===');
console.log('Project root:', projectRoot);

// Step 1: Update .env.local
console.log('\n--- Step 1: Updating .env.local ---');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const secretConfig = '\n# Better Auth Configuration\nBETTER_AUTH_SECRET="learn_quran_academy_better_auth_secret_key_2026_super_secure_32_chars"\nBETTER_AUTH_URL="http://localhost:3000"\n';

if (!envContent.includes('BETTER_AUTH_SECRET')) {
  fs.appendFileSync(envPath, secretConfig, 'utf8');
  console.log('✅ BETTER_AUTH_SECRET and BETTER_AUTH_URL successfully appended to .env.local');
} else {
  console.log('ℹ️ BETTER_AUTH_SECRET already present in .env.local');
}

// Step 2: Validate Prisma Schema
console.log('\n--- Step 2: Validating Prisma Schema ---');
try {
  const validateOutput = execSync('npx prisma validate', {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  console.log(validateOutput);
  console.log('✅ Prisma schema validation passed!');
} catch (error) {
  console.error('❌ Prisma schema validation failed:', error.stdout || error.message);
  process.exit(1);
}

// Step 3: Push Prisma Schema to Neon DB
console.log('\n--- Step 3: Pushing Prisma Schema to Neon PostgreSQL ---');
try {
  const pushOutput = execSync('npx prisma db push', {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  console.log(pushOutput);
  console.log('✅ Prisma db push succeeded!');
} catch (error) {
  console.error('❌ Prisma db push failed:', error.stdout || error.message);
  process.exit(1);
}

// Step 4: Generate Prisma Client
console.log('\n--- Step 4: Generating Prisma Client ---');
try {
  const generateOutput = execSync('npx prisma generate', {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  console.log(generateOutput);
  console.log('✅ Prisma client generation succeeded!');
} catch (error) {
  console.error('❌ Prisma client generation failed:', error.stdout || error.message);
  process.exit(1);
}

// Step 5: Test Database Connection & Operations
console.log('\n--- Step 5: Running test-db.mjs ---');
try {
  const testOutput = execSync('node test-db.mjs', {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  console.log(testOutput);
  console.log('✅ test-db.mjs verification succeeded!');
} catch (error) {
  console.error('❌ test-db.mjs failed:', error.stdout || error.message);
  process.exit(1);
}

console.log('\n🎉 ALL MILESTONE 1 VERIFICATIONS PASSED SUCCESSFULLY!');
