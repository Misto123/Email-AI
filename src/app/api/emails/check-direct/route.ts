import { NextResponse } from "next/server";
import { Pool } from "pg";

// Direct Postgres connection bypassing PostgREST
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    console.log('[CHECK-MAIL-DIRECT] Starting direct database check...');
    
    // Get mailboxes directly from database
    const mailboxResult = await client.query(`
      SELECT id, email, encrypted_password, ai_enabled, prompt, 
             imap_host, imap_port, smtp_host, smtp_port
      FROM mailboxes
      WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
    `);
    
    console.log('[CHECK-MAIL-DIRECT] Found mailboxes:', mailboxResult.rows.length);
    
    const results = mailboxResult.rows.map(mb => ({
      email: mb.email,
      imap_configured: mb.imap_host !== null,
      imap_host: mb.imap_host,
      imap_port: mb.imap_port,
      smtp_configured: mb.smtp_host !== null,
      smtp_host: mb.smtp_host,
      smtp_port: mb.smtp_port,
      has_password: mb.encrypted_password !== null
    }));
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Direct database access working',
      mailboxes: results,
      note: 'This bypasses PostgREST completely'
    });
    
  } catch (error) {
    console.error('[CHECK-MAIL-DIRECT] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
