#!/usr/bin/env node

/**
 * Apply database migrations for multi-site platform
 * 
 * This script applies the SQL migrations to your Supabase database.
 * 
 * Usage:
 *   node scripts/apply-migrations.mjs
 * 
 * Environment variables required:
 *   POSTGRES_URL or DATABASE_URL - PostgreSQL connection string
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

async function applyMigrations() {
  // Get database URL from environment
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: POSTGRES_URL or DATABASE_URL environment variable not set');
    console.error('');
    console.error('Please set one of these environment variables with your Supabase connection string:');
    console.error('  export POSTGRES_URL="postgresql://..."');
    console.error('  or');
    console.error('  export DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log('');

    // Migration files in order
    const migrations = [
      '001_multi_site_platform.sql',
      '002_seed_data.sql',
    ];

    for (const migrationFile of migrations) {
      console.log(`📝 Applying migration: ${migrationFile}`);
      
      const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile);
      const sql = await readFile(migrationPath, 'utf-8');
      
      try {
        await client.query(sql);
        console.log(`✅ Successfully applied: ${migrationFile}`);
      } catch (error) {
        console.error(`❌ Error applying ${migrationFile}:`);
        console.error(error.message);
        
        // Continue with other migrations even if one fails
        // (Some might already be applied)
        if (error.message.includes('already exists')) {
          console.log('   (Table/function already exists, skipping...)');
        } else {
          throw error;
        }
      }
      console.log('');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('sites', 'site_config', 'deployments', 'site_domains', 'deployment_logs')
      ORDER BY table_name
    `);
    
    console.log('✅ Tables created:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    console.log('');

    // Show site count
    const siteCount = await client.query('SELECT COUNT(*) as count FROM sites');
    console.log(`📊 Total sites: ${siteCount.rows[0].count}`);
    
    // Show sites
    const sites = await client.query(`
      SELECT site_id, domain, name, status 
      FROM sites 
      ORDER BY created_at DESC
    `);
    
    if (sites.rows.length > 0) {
      console.log('');
      console.log('🌐 Sites:');
      sites.rows.forEach(site => {
        console.log(`   - ${site.site_id} (${site.name}) - ${site.domain} [${site.status}]`);
      });
    }
    
    console.log('');
    console.log('✅ All migrations applied successfully!');
    
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
applyMigrations();
