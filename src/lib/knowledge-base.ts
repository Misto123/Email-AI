export interface KnowledgeArticle {
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  readingTime: string;
  updatedAt: string;
  keywords: string[];
  sections: { id: string; title: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
}

export const knowledgeBaseCategories = [
  { slug: "getting-started", name: "Getting started", description: "Simple guides for making the most of every offer." },
  { slug: "saving-guides", name: "Saving guides", description: "Practical ways to compare offers and spend with confidence." },
  { slug: "how-it-works", name: "How it works", description: "Clear answers about offers, eligibility, and activation." },
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "how-to-compare-an-energy-offer",
    category: "Saving guides",
    categorySlug: "saving-guides",
    title: "How to compare an energy offer before you switch",
    excerpt: "A practical checklist for comparing rates, conditions, contract terms, and the real value of an energy offer.",
    readingTime: "6 min read",
    updatedAt: "2026-08-24",
    keywords: ["energy offer", "compare energy prices", "saving guide"],
    sections: [
      { id: "start-with-your-usage", title: "Start with your usage", paragraphs: ["The best offer depends on how much energy your household uses and when it uses it. Begin with a recent annual statement rather than comparing headline prices alone.", "Separate fixed costs from consumption costs. This makes it easier to compare like for like and avoid being distracted by a single promotional number."] },
      { id: "check-the-conditions", title: "Check the conditions", paragraphs: ["Read the eligibility rules, contract length, cancellation terms, and any welcome or referral conditions. An offer is only useful when it matches your situation.", "Look for the last-checked date on this page and confirm the provider’s own terms before you activate an offer."] },
      { id: "calculate-the-real-value", title: "Calculate the real value", paragraphs: ["Add the advertised saving to the cost of switching, recurring fees, and any requirements. A simple annual estimate gives you a clearer comparison than a short-term headline.", "Use the offer widget on this page to view the current activation route. Offers are reviewed monthly and may expire earlier when the provider changes its terms."] },
    ],
    faqs: [
      { question: "What should I compare first?", answer: "Compare the total estimated annual cost, including fixed fees, variable rates, contract terms, and eligibility requirements." },
      { question: "How often are offers checked?", answer: "Our deal content is reviewed monthly. Always confirm the provider’s live terms before activating an offer." },
    ],
  },
  {
    slug: "understanding-friend-discounts",
    category: "Getting started",
    categorySlug: "getting-started",
    title: "Understanding friend discounts and referral offers",
    excerpt: "What a friend discount usually includes, how activation works, and which details to verify before sharing an offer.",
    readingTime: "5 min read",
    updatedAt: "2026-08-24",
    keywords: ["friend discount", "referral offer", "activation guide"],
    sections: [
      { id: "what-a-friend-discount-is", title: "What a friend discount is", paragraphs: ["A friend discount is a promotional benefit connected to a referral or invitation. The benefit may apply to a new customer, the referring customer, or both.", "The exact reward varies by provider, so the offer description and linked terms should always be treated as the source of truth."] },
      { id: "how-activation-works", title: "How activation works", paragraphs: ["Select the offer, review the expiry date and eligibility, then use the activation button. Some offers use a code; others apply automatically through a tracked landing page.", "When an offer does not require a code, the activation window will tell you that the offer has opened in a new window."] },
      { id: "before-you-share", title: "Before you share", paragraphs: ["Check whether the offer is limited to new customers, whether a minimum commitment applies, and whether the provider limits the number of referrals.", "If a condition changes, report it through the offer feedback controls so the listing can be reviewed."] },
    ],
    faqs: [
      { question: "Do all referral offers use a code?", answer: "No. Some offers use a code while others apply through an activation or referral link." },
      { question: "Can I share an offer with anyone?", answer: "Sharing rules depend on the provider. Review the offer terms and any eligibility conditions first." },
    ],
  },
  {
    slug: "offer-expiry-and-last-checked-dates",
    category: "How it works",
    categorySlug: "how-it-works",
    title: "Offer expiry dates and last-checked status explained",
    excerpt: "Learn how expiry dates, monthly refreshes, and verified status work across our offer library.",
    readingTime: "4 min read",
    updatedAt: "2026-08-24",
    keywords: ["offer expiry", "last checked", "verified offer"],
    sections: [
      { id: "why-expiry-matters", title: "Why expiry matters", paragraphs: ["Promotions can change quickly. An expiry date tells you when the offer is scheduled to end, while the provider may withdraw it sooner.", "The countdown on an offer is calculated from the configured expiry. When no date is configured, it automatically runs to the end of the current month."] },
      { id: "monthly-review-process", title: "Our monthly review process", paragraphs: ["The knowledge base and offer library use a monthly review rhythm. Each listing carries an updated date so you can see when its information was last reviewed.", "Monthly review is a freshness signal, not a guarantee. Confirm the provider’s terms at the activation destination."] },
      { id: "report-a-change", title: "Report a change", paragraphs: ["If an offer no longer works, use the worked or did-not-work controls on the offer page. This creates a review signal for the editorial team.", "We use feedback to prioritize checks and remove inactive deals from the active library."] },
    ],
    faqs: [
      { question: "What happens when an offer expires?", answer: "It should no longer be selected as the active offer, and its countdown changes to an expired state." },
      { question: "Does last checked mean guaranteed?", answer: "No. It indicates when the information was reviewed. The provider’s current terms always take priority." },
    ],
  },
];

export function getArticle(slug: string) {
  return knowledgeArticles.find((article) => article.slug === slug);
}

export function getCategory(slug: string) {
  return knowledgeBaseCategories.find((category) => category.slug === slug);
}

export function searchArticles(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return knowledgeArticles;
  return knowledgeArticles.filter((article) =>
    [article.title, article.excerpt, article.category, ...article.keywords]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
