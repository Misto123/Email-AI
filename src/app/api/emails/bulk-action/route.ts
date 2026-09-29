import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      emailIds?: string[];
      action: 'archive' | 'delete' | 'mark-spam';
    };
    
    const { emailIds, action } = body;
    
    if (!emailIds || emailIds.length === 0) {
      return NextResponse.json(
        { error: "No email IDs provided" },
        { status: 400 }
      );
    }
    
    if (emailIds.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 emails per bulk action" },
        { status: 400 }
      );
    }
    
    let error;
    
    switch (action) {
      case 'archive':
        // Archive emails
        ({ error } = await supabaseAdmin
          .from("emails")
          .update({ archived: true })
          .in("id", emailIds));
        break;
        
      case 'delete':
        // Soft delete by marking as archived and processed
        ({ error } = await supabaseAdmin
          .from("emails")
          .update({ archived: true, processed: true })
          .in("id", emailIds));
        break;
        
      case 'mark-spam':
        // Mark as spam
        ({ error } = await supabaseAdmin
          .from("emails")
          .update({ is_spam: true, spam_score: 100 })
          .in("id", emailIds));
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      affected: emailIds.length,
      action
    });
  } catch (err) {
    console.error("Bulk action error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to perform bulk action" },
      { status: 500 }
    );
  }
}
