#!/usr/bin/env node

/**
 * Seed Development Sites
 * 
 * Creates test sites in the database for local development.
 * 
 * Usage:
 *   node scripts/seed-sites.mjs
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

// Dynamic import to ensure env vars are loaded first
const { seedDevelopmentSites } = await import('../src/lib/sites/dev-helpers.js');

async function main() {
  console.log('🌱 Seeding development sites...\n');
  
  try {
    await seedDevelopmentSites();
    console.log('\n✅ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
