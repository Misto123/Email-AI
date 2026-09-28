/**
 * Parse contact form emails and extract relevant data
 */
export function parseContactFormEmail(body: string): {
  isContactForm: boolean;
  name?: string;
  email?: string;
  message?: string;
  original: string;
} {
  // Check if this is a contact form email
  const isContactForm = 
    body.includes("NEW CONTACT FORM SUBMISSION") ||
    body.includes("New Contact Form Submission") ||
    body.includes("contact form at");
  
  if (!isContactForm) {
    return { isContactForm: false, original: body };
  }
  
  // Extract name
  const nameMatch = body.match(/(?:Name|name):\s*([^\r\n]+)/);
  const name = nameMatch ? nameMatch[1].trim() : undefined;
  
  // Extract email
  const emailMatch = body.match(/(?:Email|email):\s*([^\r\n]+)/);
  const email = emailMatch ? emailMatch[1].trim() : undefined;
  
  // Extract message - try multiple patterns
  let message: string | undefined;
  
  // Pattern 1: Message:\n\nActual message
  const messageMatch1 = body.match(/(?:Message|message):\s*\n\s*\n([^\-]+)/);
  if (messageMatch1) {
    message = messageMatch1[1].trim();
  }
  
  // Pattern 2: <div>Message content</div>
  if (!message) {
    const htmlMatch = body.match(/<div[^>]*>([^<]+)<\/div>/);
    if (htmlMatch) {
      message = htmlMatch[1].trim();
    }
  }
  
  // Pattern 3: Just after "Message:" until next section
  if (!message) {
    const messageMatch2 = body.match(/(?:Message|message):\s*([^\r\n]+(?:\r?\n(?![-=])[^\r\n]+)*)/);
    if (messageMatch2) {
      message = messageMatch2[1].trim();
    }
  }
  
  // Clean up message - remove quoted-printable encoding
  if (message) {
    message = message
      .replace(/=\s*\n/g, '') // Remove soft line breaks
      .replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // Decode hex
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .trim();
  }
  
  return {
    isContactForm: true,
    name,
    email,
    message,
    original: body
  };
}
