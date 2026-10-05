import { NextResponse } from "next/server";
import {
  getOrderKeywords,
  addOrderKeyword,
  getOrderForwards,
  addOrderForward,
  updateOrderForward,
  deleteOrderForward
} from "@/lib/order-detection";

type Context = { params: Promise<{ id: string }> };

// GET - Get order detection settings for a mailbox
export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    
    const [keywords, forwards] = await Promise.all([
      getOrderKeywords(id),
      getOrderForwards(id)
    ]);
    
    return NextResponse.json({ keywords, forwards });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get order settings" },
      { status: 500 }
    );
  }
}

// POST - Add order keyword or forward rule
export async function POST(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      action: "add_keyword" | "add_forward";
      keyword?: string;
      keyword_type?: "subject" | "body" | "from";
      forward_to?: string;
      theme_color?: string;
    };
    
    if (body.action === "add_keyword") {
      if (!body.keyword) {
        return NextResponse.json({ error: "Keyword required" }, { status: 400 });
      }
      await addOrderKeyword(id, body.keyword, body.keyword_type || "subject");
    } else if (body.action === "add_forward") {
      if (!body.forward_to) {
        return NextResponse.json({ error: "Forward address required" }, { status: 400 });
      }
      await addOrderForward(id, body.forward_to, body.theme_color);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add setting" },
      { status: 500 }
    );
  }
}

// PATCH - Update forward rule
export async function PATCH(request: Request, { params }: Context) {
  try {
    await params;
    const body = await request.json() as {
      forward_id: string;
      enabled?: boolean;
      theme_color?: string;
    };
    
    if (!body.forward_id) {
      return NextResponse.json({ error: "Forward ID required" }, { status: 400 });
    }
    
    await updateOrderForward(
      body.forward_id,
      body.enabled !== undefined ? body.enabled : true,
      body.theme_color
    );
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update forward" },
      { status: 500 }
    );
  }
}

// DELETE - Delete keyword or forward
export async function DELETE(request: Request, { params }: Context) {
  try {
    await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const itemId = searchParams.get("item_id");
    
    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }
    
    if (type === "forward") {
      await deleteOrderForward(itemId);
    } else {
      const { deleteOrderKeyword } = await import("@/lib/order-detection");
      await deleteOrderKeyword(itemId);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
