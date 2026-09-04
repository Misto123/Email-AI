#!/usr/bin/env node

/**
 * Test Supabase connection and apply migrations if possible
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env.local');
    console.error('');
    console.error('Required variables:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL');
    console.error('  SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🔄 Testing Supabase connection...');
  console.log(`   URL: ${supabaseUrl}`);
  console.log('');

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Test connection by checking if sites table exists
    const { data, error } = await supabase
      .from('sites')
      .select('count')
      .limit(0);

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Database connected, but tables not created yet');
        console.log('');
        return { connected: true, tablesExist: false };
      }
      throw error;
    }

    console.log('✅ Database connected and tables exist');
    console.log('');
    return { connected: true, tablesExist: true };

  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(`   ${error.message}`);
    console.log('');
    console.log('💡 Possible reasons:');
    console.log('   - Supabase project is paused (free tier)');
    console.log('   - Connection credentials are outdated');
    console.log('   - Network/firewall issue');
    console.log('');
    console.log('🔧 To fix:');
    console.log('   1. Visit https://supabase.com/dashboard');
    console.log('   2. Check if project is paused → click "Restore"');
    console.log('   3. Verify connection string in Settings → Database');
    console.log('');
    return { connected: false, tablesExist: false };
  }
}

async function applyMigrations(supabase) {
  console.log('📝 Applying migrations via Supabase client...');
  console.log('');

  const migrationFiles = [
    '001_multi_site_platform.sql',
    '002_seed_data.sql',
  ];

  for (const file of migrationFiles) {
    console.log(`   Processing: ${file}`);
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', file);
    const sql = await readFile(migrationPath, 'utf-8');

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
      
      if (error) {
        console.log(`   ⚠️  ${file}: ${error.message}`);
      } else {
        console.log(`   ✅ ${file}: Applied successfully`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${file}: Cannot apply via RPC (use SQL Editor instead)`);
    }
  }

  console.log('');
}

async function showStatus(supabase) {
  console.log('📊 Database Status:');
  console.log('');

  try {
    // Check sites
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('site_id, domain, name, status');

    if (!sitesError && sites) {
      console.log(`   Sites: ${sites.length}`);
      sites.forEach(site => {
        console.log(`      - ${site.site_id} (${site.name}) → ${site.domain}`);
      });
    }

    // Check deployments
    const { data: deployments, error: deploymentsError } = await supabase
      .from('deployments')
      .select('status')
      .limit(100);

    if (!deploymentsError && deployments) {
      const successful = deployments.filter(d => d.status === 'success').length;
      console.log(`   Deployments: ${deployments.length} (${successful} successful)`);
    }

  } catch (error) {
    console.log(`   ⚠️  Cannot fetch status: ${error.message}`);
  }

  console.log('');
}

// Run
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const result = await testConnection();

  if (result.connected && !result.tablesExist) {
    console.log('🔧 Tables need to be created. Use Supabase SQL Editor:');
    console.log('   1. Go to https://supabase.com/dashboard → SQL Editor');
    console.log('   2. Copy supabase/migrations/001_multi_site_platform.sql');
    console.log('   3. Paste and run');
    console.log('   4. Repeat for 002_seed_data.sql');
    console.log('');
  } else if (result.connected && result.tablesExist) {
    await showStatus(supabase);
    console.log('✅ Multi-site platform database is ready!');
  }
} else {
  await testConnection();
}
