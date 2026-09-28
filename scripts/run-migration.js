#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xecxfqdhqjiwngblekgf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running migration: add knowledge_base columns...');
  
  try {
    // Add website_url column
    const { error: err1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;'
    });
    
    if (err1 && !err1.message.includes('already exists')) {
      throw err1;
    }
    
    console.log('✓ Added website_url column');
    
    // Add knowledge_base column
    const { error: err2 } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';"
    });
    
    if (err2 && !err2.message.includes('already exists')) {
      throw err2;
    }
    
    console.log('✓ Added knowledge_base column');
    
    // Create index
    const { error: err3 } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);'
    });
    
    if (err3 && !err3.message.includes('already exists')) {
      throw err3;
    }
    
    console.log('✓ Created GIN index');
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log('----------------------------------------');
    console.log(`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);`);
    process.exit(1);
  }
}

runMigration();
