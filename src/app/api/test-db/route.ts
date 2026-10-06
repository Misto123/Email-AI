import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("[TEST-DB] Starting test...");
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
    }
    
    console.log("[TEST-DB] Creating pool...");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    });
    
    console.log("[TEST-DB] Connecting...");
    const client = await pool.connect();
    
    console.log("[TEST-DB] Querying mailboxes...");
    const result = await client.query(`
      SELECT email, imap_host, smtp_host
      FROM mailboxes
      WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
    `);
    
    client.release();
    await pool.end();
    
    console.log("[TEST-DB] Success!");
    
    return NextResponse.json({
      ok: true,
      mailboxes: result.rows,
      count: result.rows.length
    });
    
  } catch (error: any) {
    console.error("[TEST-DB] Error:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      code: error.code
    }, { status: 500 });
  }
}
