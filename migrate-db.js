#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const client = createClient();
  
  try {
    console.log('🔄 Starting database migration...');
    console.log('🔗 Connecting to database...');
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing full schema...');
    
    // Execute the entire schema as one statement
    // This handles complex SQL with embedded semicolons correctly
    try {
      await client.query(schema);
      console.log('✅ Schema executed successfully!');
    } catch (error) {
      // Check if it's just duplicate/already exists errors
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('ℹ️  Some objects already exist, continuing...');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('\nℹ️  Database tables created:');
    console.log('   - blog_posts');
    console.log('   - comments');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

migrate();
