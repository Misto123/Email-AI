import "server-only";

import { supabaseAdmin } from "@/lib/supabase";

/**
 * Calculate spam score for an email (0-100, higher = more likely spam)
 * Learns from historical spam training data automatically
 */
export async function calculateSpamScore(
  email: {
    from_email: string | null;
    from_name: string | null;
    subject: string | null;
    body: string;
  },
  trainingData?: Array<{ from_email: string; subject: string; body: string }>,
  customKeywords?: string[]
): Promise<number> {
  let score = 0;

  // Base spam indicators with weights
  const defaultKeywords = [
    "guest post", "backlink", "seo", "buy now", "click here", "limited time",
    "act now", "urgent", "winner", "congratulations", "free money", "casino",
    "viagra", "cialis", "weight loss", "make money", "work from home",
    "million dollars", "nigerian prince", "inheritance", "lottery",
    "premium guest posting", "high authority", "do-follow", "niche relevant"
  ];

  // Use custom keywords if provided, otherwise use defaults
  const spamKeywords = customKeywords && customKeywords.length > 0 
    ? customKeywords.map(k => k.toLowerCase().trim()).filter(k => k)
    : defaultKeywords;

  const subject = (email.subject || "").toLowerCase();
  const body = email.body.toLowerCase();
  const fromEmail = (email.from_email || "").toLowerCase();

  // Check subject for spam keywords (20 points max)
  let keywordCount = 0;
  for (const keyword of spamKeywords) {
    if (subject.includes(keyword)) keywordCount++;
  }
  score += Math.min(keywordCount * 5, 20);

  // Check body for spam keywords (20 points max)
  keywordCount = 0;
  for (const keyword of spamKeywords) {
    if (body.includes(keyword)) keywordCount++;
  }
  score += Math.min(keywordCount * 2, 20);

  // Suspicious sender patterns (20 points)
  if (fromEmail.includes("noreply") || fromEmail.includes("no-reply")) score += 5;
  if (/\d{3,}/.test(fromEmail)) score += 10; // Many numbers in email
  if (fromEmail.includes(".xyz") || fromEmail.includes(".info")) score += 5;
  
  // Known spam domains
  const spamDomains = ["@gmail.com", "@yahoo.com", "@hotmail.com"];
  const isPersonalEmail = spamDomains.some(d => fromEmail.includes(d));
  if (isPersonalEmail && (subject.includes("seo") || subject.includes("guest post"))) {
    score += 15; // Personal emails offering SEO = high spam probability
  }

  // Subject spam patterns (20 points)
  if (subject.includes("re:") && subject.includes("fwd:")) score += 10;
  if (/\p{Emoji}/u.test(subject)) score += 5;
  if (subject.toUpperCase() === subject && subject.length > 10) score += 10; // ALL CAPS

  // Body spam patterns (30 points)
  if (body.includes("unsubscribe")) score += 5;
  if ((body.match(/http/g) || []).length > 5) score += 10; // Many links
  if (body.length === 0) score += 25; // Empty body - highly suspicious
  else if (body.length < 50) score += 10; // Very short

  // Learn from user-marked spam (40 points max)
  try {
    const { data: spamHistory } = await supabaseAdmin
      .from("spam_training")
      .select("email_id, emails!inner(from_email, subject, body)")
      .eq("is_spam", true)
      .limit(100);

    if (spamHistory && spamHistory.length > 0) {
      let learningScore = 0;
      
      // Check if same sender was marked as spam before
      const sameSender = spamHistory.some((s: any) => 
        s.emails?.from_email?.toLowerCase() === fromEmail
      );
      if (sameSender) learningScore += 30;
      
      // Check for similar subject patterns
      const similarSubjects = spamHistory.filter((s: any) => {
        const spamSubject = (s.emails?.subject || "").toLowerCase();
        const words = subject.split(" ").filter(w => w.length > 3);
        return words.some(w => spamSubject.includes(w));
      });
      if (similarSubjects.length > 0) learningScore += 10;
      
      score += Math.min(learningScore, 40);
    }
  } catch (error) {
    console.error("Error learning from spam history:", error);
  }

  return Math.min(score, 100);
}

/**
 * Decode email body from various encodings
 */
export function decodeEmailBody(raw: string): string {
  try {
    // Remove MIME headers and extract plain text
    const parts = raw.split(/\r?\n\r?\n/);
    let body = parts.slice(1).join("\n\n");

    // Decode MIME encoded-words (=?UTF-8?Q?...?= or =?UTF-8?B?...?=)
    body = body.replace(/=\?([^?]+)\?([QB])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
      try {
        if (encoding.toUpperCase() === 'Q') {
          // Quoted-printable in encoded-word
          text = text.replace(/_/g, ' '); // Underscores are spaces in Q encoding
          text = text.replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
          return text;
        } else if (encoding.toUpperCase() === 'B') {
          // Base64
          return Buffer.from(text, 'base64').toString('utf-8');
        }
      } catch {
        return match;
      }
      return match;
    });

    // Decode quoted-printable
    body = body.replace(/=\r?\n/g, ""); // Remove soft line breaks
    body = body.replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

    // Fix UTF-8 mojibake (double-encoded UTF-8)
    // Ã¯ → ï, Ã© → é, â → ', etc.
    try {
      // Check if body contains mojibake patterns
      if (/Ã|â€|Ã©|Ã¯/.test(body)) {
        // Try to fix by decoding as Latin-1 then re-encoding as UTF-8
        const latin1Bytes = Array.from(body).map(char => char.charCodeAt(0));
        body = Buffer.from(latin1Bytes).toString('utf-8');
      }
    } catch {
      // If fixing fails, keep original
    }

    // Clean up common artifacts
    body = body.replace(/--[0-9a-f]{20,}[\s\S]*?Content-Type:[\s\S]*?\r?\n[\s\S]*?\r?\n/g, "");
    body = body.replace(/Content-(Type|Transfer-Encoding):.*?\r?\n/g, "");
    body = body.replace(/<[^>]+>/g, ""); // Remove HTML tags
    body = body.replace(/\r/g, "");
    
    // Decode HTML entities
    body = body.replace(/&rsquo;/g, "'");
    body = body.replace(/&lsquo;/g, "'");
    body = body.replace(/&quot;/g, '"');
    body = body.replace(/&ldquo;/g, '"');
    body = body.replace(/&rdquo;/g, '"');
    body = body.replace(/&amp;/g, "&");
    body = body.replace(/&lt;/g, "<");
    body = body.replace(/&gt;/g, ">");
    body = body.replace(/&nbsp;/g, " ");
    body = body.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
    
    // Fix common smart quotes that weren't decoded
    body = body.replace(/â€™/g, "'"); // Right single quote
    body = body.replace(/â€œ/g, '"'); // Left double quote
    body = body.replace(/â€/g, '"'); // Right double quote
    body = body.replace(/â€"/g, '–'); // En dash
    body = body.replace(/â€"/g, '—'); // Em dash
    
    body = body.trim();

    return body;
  } catch {
    return raw;
  }
}
