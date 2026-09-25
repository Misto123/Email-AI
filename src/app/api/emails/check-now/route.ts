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
      return NextResponse.json({ error: `Cron check failed: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Manual check failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check emails" },
      { status: 500 }
    );
  }
}
