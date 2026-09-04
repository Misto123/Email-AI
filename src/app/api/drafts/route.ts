import { NextResponse } from "next/server";
import { getDrafts } from "@/lib/mail-db";

export async function GET() { try { return NextResponse.json(await getDrafts()); } catch { return NextResponse.json({ error: "Unable to load drafts" }, { status: 500 }); } }
