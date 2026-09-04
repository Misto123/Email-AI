#!/usr/bin/env node

/**
 * Deploy Site CLI
 * 
 * Command-line tool for deploying sites to Cloudflare Workers.
 * 
 * Usage:
 *   node scripts/deploy-site.mjs <site-id> [options]
 * 
 * Examples:
 *   node scripts/deploy-site.mjs anwb-energie
 *   node scripts/deploy-site.mjs anwb-energie --skip-build
 *   node scripts/deploy-site.mjs memorable-me --environment staging
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

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node scripts/deploy-site.mjs <site-id> [options]

Arguments:
  site-id              Site ID (slug) or UUID

Options:
  --skip-build         Skip Next.js build step
  --environment <env>  Environment (production, staging, preview)
  --deployed-by <name> Name of person deploying
  --notes <text>       Deployment notes
  --help, -h           Show this help message

Examples:
  node scripts/deploy-site.mjs anwb-energie
  node scripts/deploy-site.mjs anwb-energie --skip-build
  node scripts/deploy-site.mjs memorable-me --environment staging
    `);
    process.exit(0);
  }

  const siteId = args[0];
  const options = {
    siteId,
    skipBuild: args.includes('--skip-build'),
    environment: undefined,
    deployedBy: undefined,
    notes: undefined,
  };

  // Parse environment
  const envIndex = args.indexOf('--environment');
  if (envIndex !== -1 && args[envIndex + 1]) {
    options.environment = args[envIndex + 1];
  }

  // Parse deployed-by
  const deployedByIndex = args.indexOf('--deployed-by');
  if (deployedByIndex !== -1 && args[deployedByIndex + 1]) {
    options.deployedBy = args[deployedByIndex + 1];
  }

  // Parse notes
  const notesIndex = args.indexOf('--notes');
  if (notesIndex !== -1 && args[notesIndex + 1]) {
    options.notes = args[notesIndex + 1];
  }

  return options;
}

async function main() {
  const options = parseArgs();

  console.log('\n🚀 Multi-Site Deployment');
  console.log('========================\n');
  console.log(`Site ID: ${options.siteId}`);
  console.log(`Environment: ${options.environment || 'production'}`);
  console.log(`Skip Build: ${options.skipBuild ? 'Yes' : 'No'}`);
  console.log('');

  try {
    const result = await deploymentService.deploySite(options);

    console.log('\n📋 Deployment Steps:');
    console.log('====================\n');

    result.steps.forEach((step, index) => {
      const icon = step.status === 'success' ? '✅' : 
                   step.status === 'failed' ? '❌' :
                   step.status === 'running' ? '⏳' : '⏸️';
      
      console.log(`${index + 1}. ${icon} ${step.name}: ${step.message}`);
      
      if (step.error) {
        console.log(`   Error: ${step.error}`);
      }
    });

    console.log('');

    if (result.success) {
      console.log('✅ Deployment Successful!\n');
      console.log(`Deployment ID: ${result.deployment.id}`);
      console.log(`Commit: ${result.deployment.commit_sha.substring(0, 7)}`);
      console.log(`Worker: ${result.deployment.worker_name}`);
      console.log('');
    } else {
      console.log('❌ Deployment Failed!\n');
      console.log(`Error: ${result.error}`);
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Deployment Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

main();
