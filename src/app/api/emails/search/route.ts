import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const mailboxId = searchParams.get('mailbox');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');
    const status = searchParams.get('status'); // pending, draft, sent, archived
    const minSpam = searchParams.get('minSpam');
    const maxSpam = searchParams.get('maxSpam');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Search both emails and drafts
    const results: { emails: any[], drafts: any[] } = { emails: [], drafts: [] };
    
    // Search emails if status is pending or not specified
    if (!status || status === 'pending' || status === 'all') {
      let emailQuery = supabaseAdmin
        .from("emails")
        .select("id,mailbox_id,from_email,from_name,subject,body,received_at,spam_score,is_spam,processed,archived,mailboxes(email)", { count: 'exact' });
      
      // Text search
      if (query) {
        emailQuery = emailQuery.or(`subject.ilike.%${query}%,body.ilike.%${query}%,from_email.ilike.%${query}%,from_name.ilike.%${query}%`);
      }
      
      // Filter by mailbox
      if (mailboxId && mailboxId !== 'all') {
        emailQuery = emailQuery.eq('mailbox_id', mailboxId);
      }
      
      // Filter by date range
      if (dateFrom) {
        emailQuery = emailQuery.gte('received_at', dateFrom);
      }
      if (dateTo) {
        emailQuery = emailQuery.lte('received_at', dateTo);
      }
      
      // Filter by spam score
      if (minSpam) {
        emailQuery = emailQuery.gte('spam_score', parseInt(minSpam));
      }
      if (maxSpam) {
        emailQuery = emailQuery.lte('spam_score', parseInt(maxSpam));
      }
      
      // Filter by status
      if (status === 'pending') {
        emailQuery = emailQuery.eq('processed', false).eq('archived', false);
      } else if (status === 'archived') {
        emailQuery = emailQuery.eq('archived', true);
      }
      
      emailQuery = emailQuery.order("received_at", { ascending: false });
      
      const { data: emailData, error: emailError } = await emailQuery.range(offset, offset + limit - 1);
      
      if (!emailError) {
        results.emails = emailData || [];
      }
    }
    
    // Search drafts if status is draft or not specified
    if (!status || status === 'draft' || status === 'all') {
      let draftQuery = supabaseAdmin
        .from("drafts")
        .select("id,email_id,mailbox_id,draft_body,status,created_at,updated_at,emails(id,mailbox_id,message_id,from_email,from_name,subject,body,received_at,spam_score,mailboxes(email))", { count: 'exact' })
        .neq("status", "deleted");
      
      // Text search in draft body
      if (query) {
        draftQuery = draftQuery.ilike('draft_body', `%${query}%`);
      }
      
      // Filter by mailbox
      if (mailboxId && mailboxId !== 'all') {
        draftQuery = draftQuery.eq('mailbox_id', mailboxId);
      }
      
      // Filter by status
      if (status === 'draft') {
        draftQuery = draftQuery.eq('status', 'draft');
      } else if (status === 'sent') {
        draftQuery = draftQuery.eq('status', 'sent');
      }
      
      draftQuery = draftQuery.order("updated_at", { ascending: false });
      
      const { data: draftData, error: draftError } = await draftQuery.range(offset, offset + limit - 1);
      
      if (!draftError) {
        results.drafts = draftData || [];
      }
    }
    
    const totalResults = results.emails.length + results.drafts.length;
    
    return NextResponse.json({
      data: results,
      query,
      filters: {
        mailbox: mailboxId,
        dateFrom,
        dateTo,
        status,
        minSpam,
        maxSpam
      },
      pagination: {
        page,
        limit,
        total: totalResults,
        pages: Math.ceil(totalResults / limit)
      }
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Unable to search emails" },
      { status: 500 }
    );
  }
}
