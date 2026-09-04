#!/usr/bin/env node

/**
 * List All Sites
 * 
 * Lists all sites in the database with their configuration.
 * 
 * Usage:
 *   node scripts/list-sites.mjs
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

// Dynamic import
const { listAllSites } = await import('../src/lib/sites/dev-helpers.js');

async function main() {
  try {
    await listAllSites();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
