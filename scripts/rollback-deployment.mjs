#!/usr/bin/env node

/**
 * Rollback Deployment CLI
 * 
 * Command-line tool for rolling back to a previous deployment.
 * 
 * Usage:
 *   node scripts/rollback-deployment.mjs <site-id> <deployment-id>
 * 
 * Examples:
 *   node scripts/rollback-deployment.mjs anwb-energie abc-123-def
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

// Dynamic import
const { deploymentService } = await import('../src/lib/deployment/service.js');
const { deploymentDb } = await import('../src/lib/deployment/database.js');

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node scripts/rollback-deployment.mjs <site-id> <deployment-id>

Arguments:
  site-id         Site ID (slug) or UUID
  deployment-id   Target deployment ID to rollback to

Options:
  --help, -h      Show this help message

Examples:
  # List recent deployments first
  node scripts/list-deployments.mjs anwb-energie

  # Rollback to specific deployment
  node scripts/rollback-deployment.mjs anwb-energie abc-123-def
    `);
    process.exit(0);
  }

  const siteId = args[0];
  const deploymentId = args[1];

  console.log('\n🔄 Rollback Deployment');
  console.log('======================\n');
  console.log(`Site ID: ${siteId}`);
  console.log(`Target Deployment: ${deploymentId}`);
  console.log('');

  try {
    // Show target deployment info
    const targetDeployment = await deploymentDb.getDeployment(deploymentId);
    
    if (!targetDeployment) {
      console.error(`❌ Deployment not found: ${deploymentId}`);
      process.exit(1);
    }

    console.log('Target Deployment Info:');
    console.log(`  Commit: ${targetDeployment.commit_sha.substring(0, 7)}`);
    console.log(`  Message: ${targetDeployment.commit_message}`);
    console.log(`  Status: ${targetDeployment.status}`);
    console.log(`  Deployed: ${new Date(targetDeployment.created_at).toLocaleString()}`);
    console.log('');

    // Confirm rollback
    console.log('⚠️  This will rollback the site to the above deployment.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Perform rollback
    console.log('🔄 Starting rollback...\n');

    const result = await deploymentService.rollbackDeployment(
      siteId,
      deploymentId,
      'cli'
    );

    console.log('📋 Rollback Steps:');
    console.log('==================\n');

    result.steps.forEach((step, index) => {
      const icon = step.status === 'success' ? '✅' : 
                   step.status === 'failed' ? '❌' :
                   step.status === 'running' ? '⏳' : '⏸️';
      
      console.log(`${index + 1}. ${icon} ${step.name}: ${step.message}`);
    });

    console.log('');

    if (result.success) {
      console.log('✅ Rollback Successful!\n');
      console.log(`Rollback Deployment ID: ${result.deployment.id}`);
      console.log('');
    } else {
      console.log('❌ Rollback Failed!\n');
      console.log(`Error: ${result.error}`);
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Rollback Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

main();
