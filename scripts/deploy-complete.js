#!/usr/bin/env node

/**
 * Complete automated deployment using direct PostgreSQL connection
 * Bypasses Supabase REST API cache issues
 */

const { Client } = require('pg');
const https = require('https');
const http = require('http');

const ADMIN_PASSWORD = 'rereeu';
const LOCAL_API = 'http://localhost:3000';

// PostgreSQL connection (pooler)
const DB_CONFIG = {
  connectionString: 'postgresql://postgres.gmsrnnwaripxnkfyiydi:4s,JM4f4xQ9=@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
};

const TEST_SITE = {
  site_id: 'fundingpips',
  domain: 'fundingpips.nasdaq-signals.com',
  worker_name: 'fundingpips-worker',
  name: 'Funding Pips Discount Code',
  zone_id: 'b454cb2432e36e3c0b0ca4ad40ee7837', // nasdaq-signals.com
  status: 'active',
  deployment_status: 'never_deployed'
};

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('🚀 COMPLETE AUTOMATED CLOUDFLARE DEPLOYMENT\n');
  
  const client = new Client(DB_CONFIG);
  
  try {
    // Step 1: Connect to database
    console.log('Step 1: Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');
    
    // Step 2: Check/create site
    console.log('Step 2: Checking if site exists...');
    const check = await client.query('SELECT id FROM sites WHERE site_id = $1', [TEST_SITE.site_id]);
    
    let siteId;
    if (check.rows.length > 0) {
      siteId = check.rows[0].id;
      console.log(`✅ Site exists (ID: ${siteId})\n`);
    } else {
      console.log('Creating new site...');
      const id = 'fundingpips-' + Date.now();
      await client.query(`
        INSERT INTO sites (id, site_id, domain, worker_name, name, status, zone_id, deployment_status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [id, TEST_SITE.site_id, TEST_SITE.domain, TEST_SITE.worker_name, TEST_SITE.name, TEST_SITE.status, TEST_SITE.zone_id, TEST_SITE.deployment_status]);
      
      siteId = id;
      console.log(`✅ Site created (ID: ${siteId})\n`);
    }
    
    await client.end();
    
    // Step 3: Login to admin
    console.log('Step 3: Logging in to admin...');
    const login = await request(`${LOCAL_API}/api/admin/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { password: ADMIN_PASSWORD });
    
    if (login.status !== 200) {
      console.log('❌ Login failed. Is dev server running?');
      process.exit(1);
    }
    
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    console.log('✅ Logged in\n');
    
    // Step 4: Deploy to Cloudflare
    console.log('Step 4: Deploying to Cloudflare (production)...');
    console.log('  Domain:', TEST_SITE.domain);
    console.log('  Zone ID:', TEST_SITE.zone_id);
    console.log('  Worker:', TEST_SITE.worker_name);
    
    const deploy = await request(`${LOCAL_API}/api/admin/sites/${siteId}/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    });
    
    if (deploy.status !== 200) {
      console.log('\n❌ Deployment failed:', JSON.stringify(deploy.body, null, 2));
      process.exit(1);
    }
    
    console.log('\n✅ DEPLOYED TO PRODUCTION!');
    console.log('  Worker ID:', deploy.body.workerId);
    console.log('  Route ID:', deploy.body.routeId);
    
    // Step 5: Deploy preview
    console.log('\nStep 5: Deploying preview...');
    const preview = await request(`${LOCAL_API}/api/admin/sites/${siteId}/deploy-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    });
    
    if (preview.status === 200) {
      console.log('✅ Preview deployed!');
      console.log('  Preview URL:', preview.body.previewUrl);
    } else {
      console.log('⚠️  Preview deployment failed:', preview.body);
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEPLOYMENT COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📍 Production URL:  https://' + TEST_SITE.domain);
    if (preview.status === 200) {
      console.log('📍 Preview URL:     ' + preview.body.previewUrl);
    }
    console.log('📍 Admin Panel:     ' + LOCAL_API + '/admin/sites');
    console.log('\n✅ Your Cloudflare multi-site deployment system is LIVE!');
    console.log('\nCheck Cloudflare dashboard:');
    console.log('  https://dash.cloudflare.com/461a686448dba495410aefba52b5123b/workers-and-pages');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
