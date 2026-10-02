/**
 * Contract Analysis Helpers for Learn Quran Academy Migration
 * Inspects source files, schemas, and configurations against interface contracts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..', '..');

/**
 * Reads a project file relative to root directory
 */
export function readProjectFile(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Checks if a project file exists
 */
export function projectFileExists(relPath) {
  return fs.existsSync(path.join(ROOT_DIR, relPath));
}

/**
 * Parses package.json
 */
export function getPackageJson() {
  const content = readProjectFile('package.json');
  if (!content) return null;
  return JSON.parse(content);
}

/**
 * Parses prisma/schema.prisma into structured models and enums
 */
export function parsePrismaSchema() {
  const content = readProjectFile('prisma/schema.prisma');
  if (!content) return null;

  const models = {};
  const enums = {};

  const lines = content.split('\n');
  let currentModel = null;
  let currentEnum = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('model ')) {
      const modelName = line.split(/\s+/)[1];
      currentModel = { name: modelName, fields: {}, raw: [] };
      models[modelName] = currentModel;
      continue;
    }

    if (line.startsWith('enum ')) {
      const enumName = line.split(/\s+/)[1];
      currentEnum = { name: enumName, values: [] };
      enums[enumName] = currentEnum;
      continue;
    }

    if (line === '}') {
      currentModel = null;
      currentEnum = null;
      continue;
    }

    if (currentEnum && line && !line.startsWith('//')) {
      currentEnum.values.push(line);
    }

    if (currentModel && line && !line.startsWith('//') && !line.startsWith('@@')) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const fieldName = parts[0];
        const fieldType = parts[1];
        const attributes = parts.slice(2).join(' ');
        currentModel.fields[fieldName] = {
          name: fieldName,
          type: fieldType,
          attributes,
        };
      }
      currentModel.raw.push(line);
    }
  }

  return { models, enums, rawContent: content };
}

/**
 * Analyzes a route file for migration compliance
 */
export function analyzeRouteHandler(routeRelativePath) {
  const code = readProjectFile(routeRelativePath);
  if (!code) {
    return { exists: false };
  }

  const usesSupabase = code.includes('@supabase') || code.includes('createClient');
  const usesPrisma = code.includes('prisma') || code.includes('@prisma/client') || code.includes('@/lib/prisma');
  const usesClerk = code.includes('@clerk/nextjs') || code.includes('auth()') || code.includes('currentUser()') || code.includes('clerkClient');
  
  const hasGET = /export\s+async\s+function\s+GET\b/.test(code);
  const hasPOST = /export\s+async\s+function\s+POST\b/.test(code);
  const hasPUT = /export\s+async\s+function\s+PUT\b/.test(code);
  const hasDELETE = /export\s+async\s+function\s+DELETE\b/.test(code);

  return {
    exists: true,
    code,
    usesSupabase,
    usesPrisma,
    usesClerk,
    methods: {
      GET: hasGET,
      POST: hasPOST,
      PUT: hasPUT,
      DELETE: hasDELETE,
    },
  };
}
