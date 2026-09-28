#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xecxfqdhqjiwngblekgf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumns() {
  console.log('Testing if columns exist...\n');
  
  // Try to query the columns - if they don't exist, we'll get an error
  const { data, error } = await supabase
    .from('mailboxes')
    .select('id, email, website_url, knowledge_base')
    .limit(1);
  
  if (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('❌ Columns do not exist yet.');
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
      console.log('='.repeat(60));
      console.log(`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);`);
      console.log('='.repeat(60));
      console.log('\nURL: https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
  
  console.log('✅ Columns exist! Migration already complete.');
  console.log('\nSample data:', data);
  console.log('\nYou can now proceed with testing the Knowledge Base UI.');
}

testColumns();
