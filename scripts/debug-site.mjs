#!/usr/bin/env node

/**
 * Debug Site
 * 
 * Shows detailed information about a site.
 * 
 * Usage:
 *   node scripts/debug-site.mjs localhost:3000
 *   node scripts/debug-site.mjs anwb-energie.nl
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

// Dynamic import
const { debugSite } = await import('../src/lib/sites/dev-helpers.js');

async function main() {
  const domain = process.argv[2];
  
  if (!domain) {
    console.error('Usage: node scripts/debug-site.mjs <domain>');
    console.error('Example: node scripts/debug-site.mjs localhost:3000');
    process.exit(1);
  }
  
  try {
    await debugSite(domain);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
