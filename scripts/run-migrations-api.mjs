#!/usr/bin/env node

/**
 * Run Supabase migrations via REST API
 * Uses Supabase service role key to execute SQL directly
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function executeSql(sql) {
  // Use Supabase REST API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'params=single-object'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

async function runMigration(file) {
  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  const filePath = join(migrationsDir, file);
  
  console.log(`\n📄 Running: ${file}`);
  
  try {
    const sql = readFileSync(filePath, 'utf8');
    
    // Try to execute via REST API
    await executeSql(sql);
    
    console.log(`✅ Success: ${file}`);
    return { success: true, file };
  } catch (err) {
    console.error(`❌ Failed: ${file}`);
    console.error(`   Error: ${err.message}`);
    return { success: false, file, error: err.message };
  }
}

async function runMigrations() {
  console.log('🚀 Supabase Migration Runner (REST API)\n');

  const migrations = ['003_folders_and_spam_learning.sql', '004_spam_settings.sql', '005_connection_status.sql'];
  const results = [];

  for (const file of migrations) {
    const result = await runMigration(file);
    results.push(result);
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  Some migrations failed.');
    console.log('💡 This usually means the function exec_sql doesn\'t exist in Supabase.');
    console.log('    Using the HTML migration tool instead...\n');
  } else {
    console.log('\n🎉 All migrations completed successfully!');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
