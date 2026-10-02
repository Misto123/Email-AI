import { NextResponse } from "next/server";

/**
 * Public endpoint for manual email checking
 * Calls the protected cron endpoint internally
 */
export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }

    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const response = await fetch(`${baseUrl}/api/cron/check-mail`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cronSecret}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[CHECK-NOW] Cron failed:', error);
      return NextResponse.json({ error: `Check failed: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    
    // Check if any mailboxes failed
    const failed = data.results?.filter((r: any) => r.error) || [];
    const success = data.results?.filter((r: any) => !r.error) || [];
    
    if (failed.length > 0 && success.length === 0) {
      // All failed
      const errors = failed.map((r: any) => `${r.mailbox}: ${r.error}`).join('\n');
      return NextResponse.json({ 
        error: `All mailboxes failed to check:\n\n${errors}`,
        results: data.results
      }, { status: 500 });
    }
    
    if (failed.length > 0) {
      // Some failed
      const errors = failed.map((r: any) => `${r.mailbox}: ${r.error}`).join('\n');
      return NextResponse.json({ 
        ok: true,
        warning: `Some mailboxes failed:\n\n${errors}`,
        results: data.results
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CHECK-NOW] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check emails" },
      { status: 500 }
    );
  }
}
