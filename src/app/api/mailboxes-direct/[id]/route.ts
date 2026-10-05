import { NextResponse } from "next/server";
import { Pool } from "pg";

// Construct DATABASE_URL from Supabase URL if not provided
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Extract project ref from SUPABASE_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error("Cannot construct DATABASE_URL: SUPABASE_URL not found");
  }
  
  const projectRef = match[1];
  // Use connection pooler (port 6543) for serverless
  return `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
};

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 1,
    });
  }
  return pool;
}

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Context) {
  let client;
  
  try {
    const dbPool = getPool();
    client = await dbPool.connect();
    
    const { id } = await params;
    const body = (await request.json()) as { 
      imap_host?: string;
      imap_port?: number;
      smtp_host?: string;
      smtp_port?: number;
      encrypted_password?: string;
      password?: string;
    };
    
    console.log('[MAILBOX-DIRECT] Updating mailbox:', id);
    console.log('[MAILBOX-DIRECT] Fields:', Object.keys(body));
    
    // Build SET clause dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (body.imap_host !== undefined) {
      updates.push(`imap_host = $${paramIndex++}`);
      values.push(body.imap_host);
    }
    if (body.imap_port !== undefined) {
      updates.push(`imap_port = $${paramIndex++}`);
      values.push(body.imap_port);
    }
    if (body.smtp_host !== undefined) {
      updates.push(`smtp_host = $${paramIndex++}`);
      values.push(body.smtp_host);
    }
    if (body.smtp_port !== undefined) {
      updates.push(`smtp_port = $${paramIndex++}`);
      values.push(body.smtp_port);
    }
    if (body.password || body.encrypted_password) {
      const password = body.password || body.encrypted_password;
      updates.push(`encrypted_password = encode(digest($${paramIndex++}, 'sha256'), 'hex')`);
      values.push(password);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    
    // Add ID as last parameter
    values.push(id);
    
    const query = `
      UPDATE mailboxes 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, imap_host, imap_port, smtp_host, smtp_port
    `;
    
    console.log('[MAILBOX-DIRECT] Executing query...');
    
    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
    }
    
    console.log('[MAILBOX-DIRECT] Success!');
    
    return NextResponse.json({ ok: true, data: result.rows[0] });
    
  } catch (error) {
    console.error('[MAILBOX-DIRECT] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unable to update mailbox",
      details: error 
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
