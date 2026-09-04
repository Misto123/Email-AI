#!/usr/bin/env node

/**
 * List Deployments CLI
 * 
 * Command-line tool for listing deployments for a site.
 * 
 * Usage:
 *   node scripts/list-deployments.mjs <site-id> [limit]
 * 
 * Examples:
 *   node scripts/list-deployments.mjs anwb-energie
 *   node scripts/list-deployments.mjs anwb-energie 20
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

// Dynamic import
const { deploymentDb } = await import('../src/lib/deployment/database.js');
const { siteDb } = await import('../src/lib/sites/database.js');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node scripts/list-deployments.mjs <site-id> [limit]

Arguments:
  site-id    Site ID (slug) or UUID
  limit      Number of deployments to show (default: 10)

Options:
  --help, -h Show this help message

Examples:
  node scripts/list-deployments.mjs anwb-energie
  node scripts/list-deployments.mjs anwb-energie 20
    `);
    process.exit(0);
  }

  const siteIdOrSlug = args[0];
  const limit = parseInt(args[1]) || 10;

  console.log('\n📋 Deployment History');
  console.log('=====================\n');

  try {
    // Load site
    let site = await siteDb.getSiteById(siteIdOrSlug);
    if (!site) {
      site = await siteDb.getSiteBySiteId(siteIdOrSlug);
    }
    if (!site) {
      console.error(`❌ Site not found: ${siteIdOrSlug}`);
      process.exit(1);
    }

    console.log(`Site: ${site.name}`);
    console.log(`Domain: ${site.domain}`);
    console.log('');

    // Get deployments
    const deployments = await deploymentDb.listDeployments({
      site_id: site.id,
      limit,
    });

    if (deployments.length === 0) {
      console.log('No deployments found.\n');
      return;
    }

    console.log(`Showing ${deployments.length} most recent deployments:\n`);

    deployments.forEach((deployment, index) => {
      const statusIcon = 
        deployment.status === 'success' ? '✅' :
        deployment.status === 'failed' ? '❌' :
        deployment.status === 'pending' ? '⏸️' :
        deployment.status === 'building' ? '🔨' :
        deployment.status === 'deploying' ? '🚀' :
        '🔄';

      console.log(`${index + 1}. ${statusIcon} ${deployment.status.toUpperCase()}`);
      console.log(`   ID: ${deployment.id}`);
      console.log(`   Commit: ${deployment.commit_sha.substring(0, 7)} - ${deployment.commit_message}`);
      console.log(`   Branch: ${deployment.branch || 'unknown'}`);
      console.log(`   Environment: ${deployment.environment}`);
      console.log(`   Type: ${deployment.deployment_type}`);
      
      if (deployment.deployed_by) {
        console.log(`   Deployed By: ${deployment.deployed_by}`);
      }
      
      console.log(`   Created: ${new Date(deployment.created_at).toLocaleString()}`);
      
      if (deployment.completed_at) {
        console.log(`   Completed: ${new Date(deployment.completed_at).toLocaleString()}`);
      }
      
      if (deployment.build_time_seconds) {
        console.log(`   Build Time: ${deployment.build_time_seconds}s`);
      }
      
      if (deployment.deploy_time_seconds) {
        console.log(`   Deploy Time: ${deployment.deploy_time_seconds}s`);
      }
      
      if (deployment.error_message) {
        console.log(`   Error: ${deployment.error_message}`);
      }
      
      console.log('');
    });

    // Summary
    const successCount = deployments.filter(d => d.status === 'success').length;
    const failedCount = deployments.filter(d => d.status === 'failed').length;
    const successRate = deployments.length > 0 
      ? ((successCount / deployments.length) * 100).toFixed(1)
      : '0.0';

    console.log('Summary:');
    console.log(`  Total: ${deployments.length}`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${failedCount}`);
    console.log(`  Success Rate: ${successRate}%`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

main();
