#!/usr/bin/env node

/**
 * Direct database insertion bypassing REST API cache
 */

const { Client } = require('pg');

const TEST_SITE = {
  id: 'fundingpips-' + Date.now(),
  site_id: 'fundingpips',
  domain: 'fundingpips.nasdaq-signals.com',
  worker_name: 'fundingpips-worker',
  name: 'Funding Pips Discount Code',
  status: 'active',
  zone_id: 'b454cb2432e36e3c0b0ca4ad40ee7837',
  deployment_status: 'never_deployed'
};

async function main() {
  const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.gmsrnnwaripxnkfyiydi',
    password: '4s,JM4f4xQ9=',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if site exists
    const check = await client.query('SELECT id FROM sites WHERE site_id = $1', [TEST_SITE.site_id]);
    
    let siteId;
    if (check.rows.length > 0) {
      siteId = check.rows[0].id;
      console.log(`✅ Site already exists (ID: ${siteId})`);
    } else {
      // Insert site
      const result = await client.query(`
        INSERT INTO sites (id, site_id, domain, worker_name, name, status, zone_id, deployment_status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `, [TEST_SITE.id, TEST_SITE.site_id, TEST_SITE.domain, TEST_SITE.worker_name, TEST_SITE.name, TEST_SITE.status, TEST_SITE.zone_id, TEST_SITE.deployment_status]);
      
      siteId = result.rows[0].id;
      console.log(`✅ Site created (ID: ${siteId})`);
    }
    
    console.log('\nSite details:');
    console.log('  Domain:', TEST_SITE.domain);
    console.log('  Worker:', TEST_SITE.worker_name);
    console.log('  Zone ID:', TEST_SITE.zone_id);
    console.log('\n✅ Ready for deployment!');
    console.log('\nNext: Deploy via admin panel or run deployment script');
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
