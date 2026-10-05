import { supabaseAdmin } from "./supabase";

interface OrderKeyword {
  keyword: string;
  keyword_type: "subject" | "body" | "from";
}

interface OrderForward {
  forward_to: string;
  enabled: boolean;
  theme_color: string;
}

/**
 * Detect if an email is an order based on keywords
 */
export async function detectOrder(
  mailboxId: string,
  subject: string,
  body: string,
  fromEmail: string
): Promise<boolean> {
  // Get keywords for this mailbox
  const { data: keywords } = await supabaseAdmin
    .from("order_keywords")
    .select("keyword, keyword_type")
    .eq("mailbox_id", mailboxId);

  if (!keywords || keywords.length === 0) return false;

  // Check each keyword
  for (const kw of keywords as OrderKeyword[]) {
    const keyword = kw.keyword.toLowerCase();
    
    switch (kw.keyword_type) {
      case "subject":
        if (subject.toLowerCase().includes(keyword)) return true;
        break;
      case "body":
        if (body.toLowerCase().includes(keyword)) return true;
        break;
      case "from":
        if (fromEmail.toLowerCase().includes(keyword)) return true;
        break;
    }
  }

  return false;
}

/**
 * Mark email as order and get forwarding rules
 */
export async function markAsOrder(emailId: string): Promise<OrderForward[]> {
  // Mark email as order
  await supabaseAdmin
    .from("emails")
    .update({
      is_order: true,
      order_detected_at: new Date().toISOString()
    })
    .eq("id", emailId);

  // Get email's mailbox to fetch forward rules
  const { data: email } = await supabaseAdmin
    .from("emails")
    .select("mailbox_id")
    .eq("id", emailId)
    .single();

  if (!email) return [];

  // Get forwarding rules for this mailbox
  const { data: forwards } = await supabaseAdmin
    .from("order_forwards")
    .select("forward_to, enabled, theme_color")
    .eq("mailbox_id", email.mailbox_id)
    .eq("enabled", true);

  return (forwards || []) as OrderForward[];
}

/**
 * Mark order as forwarded
 */
export async function markOrderForwarded(emailId: string): Promise<void> {
  await supabaseAdmin
    .from("emails")
    .update({ order_forwarded: true })
    .eq("id", emailId);
}

/**
 * Get order keywords for a mailbox
 */
export async function getOrderKeywords(mailboxId: string): Promise<OrderKeyword[]> {
  const { data } = await supabaseAdmin
    .from("order_keywords")
    .select("keyword, keyword_type")
    .eq("mailbox_id", mailboxId);

  return (data || []) as OrderKeyword[];
}

/**
 * Add order keyword
 */
export async function addOrderKeyword(
  mailboxId: string,
  keyword: string,
  keywordType: "subject" | "body" | "from" = "subject"
): Promise<void> {
  await supabaseAdmin.from("order_keywords").insert({
    mailbox_id: mailboxId,
    keyword,
    keyword_type: keywordType
  });
}

/**
 * Delete order keyword
 */
export async function deleteOrderKeyword(keywordId: string): Promise<void> {
  await supabaseAdmin.from("order_keywords").delete().eq("id", keywordId);
}

/**
 * Get order forwards for a mailbox
 */
export async function getOrderForwards(mailboxId: string): Promise<OrderForward[]> {
  const { data } = await supabaseAdmin
    .from("order_forwards")
    .select("id, forward_to, enabled, theme_color")
    .eq("mailbox_id", mailboxId);

  return (data || []) as OrderForward[];
}

/**
 * Add order forward rule
 */
export async function addOrderForward(
  mailboxId: string,
  forwardTo: string,
  themeColor: string = "#10b981"
): Promise<void> {
  await supabaseAdmin.from("order_forwards").insert({
    mailbox_id: mailboxId,
    forward_to: forwardTo,
    enabled: true,
    theme_color: themeColor
  });
}

/**
 * Update order forward rule
 */
export async function updateOrderForward(
  forwardId: string,
  enabled: boolean,
  themeColor?: string
): Promise<void> {
  const updates: any = { enabled };
  if (themeColor) updates.theme_color = themeColor;

  await supabaseAdmin
    .from("order_forwards")
    .update(updates)
    .eq("id", forwardId);
}

/**
 * Delete order forward rule
 */
export async function deleteOrderForward(forwardId: string): Promise<void> {
  await supabaseAdmin.from("order_forwards").delete().eq("id", forwardId);
}
