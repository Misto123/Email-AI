import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  const { data, error } = await supabase.from('mailboxes').select('id,email').limit(5);
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success! Mailboxes:', data);
  }
} catch (err) {
  console.error('❌ Exception:', err);
}
