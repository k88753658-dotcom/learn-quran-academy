/**
/**
 * Better Auth Migration Contract Helpers
 * Inspects source files, Prisma schema, and configurations for Better Auth compliance
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, readProjectFile, projectFileExists, parsePrismaSchema } from './contract-helpers.mjs';

export { ROOT_DIR, readProjectFile, projectFileExists, parsePrismaSchema };

/**
 * Recursively gets all files in a directory
 */
export function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

/**
 * Scans src/ for any occurrence of "clerk" (case-insensitive)
 * Returns array of { file, line, content }
 */
export function findClerkOccurrencesInSrc() {
  const srcDir = path.join(ROOT_DIR, 'src');
  if (!fs.existsSync(srcDir)) return [];

  const files = getAllFiles(srcDir);
  const matches = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/clerk/i.test(line)) {
        matches.push({
          file: path.relative(ROOT_DIR, file).replace(/\\/g, '/'),
          line: idx + 1,
          content: line.trim(),
        });
      }
    });
  }

  return matches;
}

/**
 * Analyzes Better Auth models in prisma/schema.prisma
 */
export function analyzeBetterAuthSchema() {
  const parsed = parsePrismaSchema();
  if (!parsed || !parsed.models) {
    return { valid: false, error: 'Schema could not be parsed' };
  }

  const { models } = parsed;

  const hasUser = !!models.User;
  const hasSession = !!models.Session;
  const hasAccount = !!models.Account;
  const hasVerification = !!models.Verification;
  const hasProfile = !!models.Profile;

  // Inspect Profile 1:1 relation to User
  let profileUserRelation = null;
  if (hasProfile) {
    const profileModel = models.Profile;
    // Check raw lines for user relation
    const userRelLine = profileModel.raw.find((l) => /user\s+User\b/.test(l));
    const hasCascade = userRelLine ? /onDelete:\s*Cascade/.test(userRelLine) : false;
    const referencesId = userRelLine ? /references:\s*\[id\]/.test(userRelLine) : false;
    const fieldsId = userRelLine ? /fields:\s*\[id\]/.test(userRelLine) : false;

    profileUserRelation = {
      declared: !!userRelLine,
      rawLine: userRelLine || null,
      hasCascade,
      referencesId,
      fieldsId,
      isSharedPrimaryKey: hasCascade && referencesId && fieldsId,
    };
  }

  return {
    valid: true,
    hasUser,
    hasSession,
    hasAccount,
    hasVerification,
    hasProfile,
    userModel: models.User || null,
    sessionModel: models.Session || null,
    accountModel: models.Account || null,
    verificationModel: models.Verification || null,
    profileModel: models.Profile || null,
    profileUserRelation,
  };
}

/**
 * Lists all route handler files in src/app/api/
 */
export function getAllApiRouteHandlers() {
  const apiDir = path.join(ROOT_DIR, 'src', 'app', 'api');
  if (!fs.existsSync(apiDir)) return [];

  const allFiles = getAllFiles(apiDir);
  return allFiles
    .filter((f) => f.endsWith('route.ts') || f.endsWith('route.js'))
    .map((f) => path.relative(ROOT_DIR, f).replace(/\\/g, '/'));
}

/**
 * Checks whether an API route uses Better Auth session verification
 */
export function analyzeRouteSessionContract(routeRelPath) {
  const content = readProjectFile(routeRelPath);
  if (!content) return { exists: false };

  const hasClerk = /@clerk\b/i.test(content) || /\bclerkClient\b/.test(content);
  const hasGetServerSession = /getServerSession\s*\(/.test(content) || /auth\.api\.getSession\s*\(/.test(content);
  const importsSessionHelper = /from\s+['"]@\/lib\/session['"]/.test(content) || /from\s+['"]@\/lib\/auth['"]/.test(content);
  const checksSession = hasGetServerSession || /session\b/.test(content);
  const returns401 = /401\b/.test(content) || /Unauthorized/i.test(content);

  return {
    exists: true,
    hasClerk,
    hasGetServerSession,
    importsSessionHelper,
    checksSession,
    returns401,
  };
}
