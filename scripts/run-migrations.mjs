#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * 
 * Usage:
 *   npm run migrate        - Run all pending migrations
 *   npm run migrate 003    - Run specific migration (e.g., 003_folders_and_spam_learning.sql)
 * 
 * Setup:
 *   1. Get your database connection string from Supabase:
 *      Dashboard → Settings → Database → Connection String (URI)
 *   2. Add to .env.local:
 *      DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xecxfqdhqjiwngblekgf.supabase.co:5432/postgres
 */

import { config } from 'dotenv';
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in .env.local\n');
  console.error('📝 To get your database URL:');
  console.error('   1. Go to: https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/settings/database');
  console.error('   2. Copy "Connection String" (URI format)');
  console.error('   3. Add to .env.local:');
  console.error('      DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xecxfqdhqjiwngblekgf.supabase.co:5432/postgres\n');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration(file) {
  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  const filePath = join(migrationsDir, file);
  
  console.log(`\n📄 Running: ${file}`);
  
  try {
    const sql = readFileSync(filePath, 'utf8');
    
    // Execute the entire migration as a single transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ Success: ${file}`);
      return { success: true, file };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`❌ Failed: ${file}`);
    console.error(`   Error: ${err.message}`);
    return { success: false, file, error: err.message };
  }
}

async function runMigrations() {
  console.log('🚀 Supabase Migration Runner\n');
  console.log(`📍 Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown'}\n`);

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  
  // Get specific migration from command line args or run all
  const targetMigration = process.argv[2];
  
  let files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (targetMigration) {
    // Find migration by number or exact name
    const found = files.find(f => 
      f.startsWith(targetMigration) || f === targetMigration
    );
    
    if (!found) {
      console.error(`❌ Migration not found: ${targetMigration}\n`);
      console.log('Available migrations:');
      files.forEach(f => console.log(`   - ${f}`));
      process.exit(1);
    }
    
    files = [found];
    console.log(`🎯 Running specific migration: ${found}\n`);
  } else {
    console.log(`📦 Found ${files.length} migration files\n`);
  }

  const results = [];

  for (const file of files) {
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
    console.log('\n⚠️  Some migrations failed. Review errors above.');
    console.log('💡 Tip: Migrations may fail if already applied (tables/columns exist).');
  } else {
    console.log('\n🎉 All migrations completed successfully!');
  }

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  pool.end();
  process.exit(1);
});
