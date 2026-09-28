/**
 * Knowledge Base Structure
 * Stored in mailboxes.knowledge_base (JSONB)
 */

export interface FAQItem {
  q: string; // Question
  a: string; // Answer
}

export interface CommonResponses {
  pricing_inquiry?: string;
  timeline_question?: string;
  feature_request?: string;
  technical_support?: string;
  general_inquiry?: string;
  [key: string]: string | undefined;
}

export interface KnowledgeBase {
  faq?: FAQItem[];
  website_context?: string; // About the company/service
  common_responses?: CommonResponses;
  brand_voice?: string; // Tone and style guidelines
  services?: string[]; // List of services offered
  pricing_info?: string;
}

export interface MailboxWithKnowledgeBase {
  id: string;
  email: string;
  ai_enabled: boolean;
  ai_prompt?: string;
  website_url?: string;
  knowledge_base: KnowledgeBase;
}

/**
 * Context assembled for AI reply generation
 */
export interface AIContext {
  mailbox: MailboxWithKnowledgeBase;
  email: {
    subject: string;
    body: string;
    from_email: string;
    from_name?: string;
  };
  knowledgeBase?: KnowledgeBase;
  relevantFAQs?: FAQItem[];
  pastConversations?: PastConversation[];
}

export interface PastConversation {
  subject: string;
  body: string;
  reply: string;
  received_at: string;
}
