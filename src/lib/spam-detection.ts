import "server-only";

/**
 * Calculate spam score for an email (0-100, higher = more likely spam)
 */
export function calculateSpamScore(email: {
  from_email: string | null;
  from_name: string | null;
  subject: string | null;
  body: string;
}): number {
  let score = 0;

  // Spam indicators with weights
  const spamKeywords = [
    "guest post", "backlink", "seo", "buy now", "click here", "limited time",
    "act now", "urgent", "winner", "congratulations", "free money", "casino",
    "viagra", "cialis", "weight loss", "make money", "work from home",
    "million dollars", "nigerian prince", "inheritance", "lottery"
  ];

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

  // Subject spam patterns (20 points)
  if (subject.includes("re:") && subject.includes("fwd:")) score += 10;
  if (/\p{Emoji}/u.test(subject)) score += 5;
  if (subject.toUpperCase() === subject && subject.length > 10) score += 10; // ALL CAPS

  // Body spam patterns (20 points)
  if (body.includes("unsubscribe")) score += 5;
  if ((body.match(/http/g) || []).length > 5) score += 10; // Many links
  if (body.length < 50) score += 5; // Very short

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

    // Decode quoted-printable
    body = body.replace(/=\r?\n/g, ""); // Remove soft line breaks
    body = body.replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

    // Clean up common artifacts
    body = body.replace(/--[0-9a-f]{20,}[\s\S]*?Content-Type:[\s\S]*?\r?\n[\s\S]*?\r?\n/g, "");
    body = body.replace(/Content-(Type|Transfer-Encoding):.*?\r?\n/g, "");
    body = body.replace(/<[^>]+>/g, ""); // Remove HTML tags
    body = body.replace(/\r/g, "");
    body = body.trim();

    return body;
  } catch {
    return raw;
  }
}
