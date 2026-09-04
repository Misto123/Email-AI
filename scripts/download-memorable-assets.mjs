#!/usr/bin/env node
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = join(__dirname, '..');
const PUBLIC_DIR = join(BASE_DIR, 'public/memorable.me');

const assets = [
  // Logo
  { url: 'https://memorable.me/assets/memorable_logo-3119c182.png', path: 'images/memorable-logo.png' },
  
  // Flags
  { url: 'https://memorable.me/assets/flags/en-e2eb40b8.svg', path: 'images/flags/en.svg' },
  
  // Hero faces
  { url: 'https://memorable.me/assets/home/face-1-18201f39.png', path: 'images/face-1.png' },
  { url: 'https://memorable.me/assets/home/face-2-e9836563.png', path: 'images/face-2.png' },
  
  // Payment logos
  { url: 'https://memorable.me/assets/home/pay-visa-288ea44f.png', path: 'images/pay-visa.png' },
  { url: 'https://memorable.me/assets/home/pay-mastercard-05e457de.png', path: 'images/pay-mastercard.png' },
  { url: 'https://memorable.me/assets/home/pay-applepay-824aaa73.png', path: 'images/pay-applepay.png' },
  
  // Hero phone
  { url: 'https://memorable.me/assets/home/hero-phone-275b3276.png', path: 'images/hero-phone.png' },
  
  // QR code
  { url: 'https://memorable.me/assets/home/qr-code-03fb3dc1.png', path: 'images/qr-code.png' },
  
  // Payer avatar
  { url: 'https://memorable.me/assets/home/payer-avatar-bfd59717.jpg', path: 'images/payer-avatar.jpg' },
  
  // Album
  { url: 'https://memorable.me/assets/home/album-59be74f9.png', path: 'images/album.png' },
];

async function downloadAsset(url, outputPath) {
  try {
    console.log(`Downloading ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const fullPath = join(PUBLIC_DIR, outputPath);
    
    // Ensure directory exists
    await mkdir(dirname(fullPath), { recursive: true });
    
    // Write file
    await writeFile(fullPath, Buffer.from(buffer));
    console.log(`✓ Saved to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error.message);
    return false;
  }
}

async function downloadAll() {
  console.log(`Downloading ${assets.length} assets to ${PUBLIC_DIR}...\n`);
  
  // Download 4 at a time
  const batchSize = 4;
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(({ url, path }) => downloadAsset(url, path))
    );
    
    success += results.filter(Boolean).length;
    failed += results.filter(r => !r).length;
  }
  
  console.log(`\n✓ Downloaded ${success} assets`);
  if (failed > 0) {
    console.log(`✗ Failed to download ${failed} assets`);
  }
}

downloadAll().catch(console.error);
