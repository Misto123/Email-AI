# 🚀 Smart Model Router Guide

Your blog now has intelligent AI model routing that automatically saves up to **94% on costs** for simple tasks while maintaining quality for complex content.

## 🎯 What It Does

The Smart Model Router automatically:

1. **Routes requests** to the most cost-effective model based on task type
2. **Uses GPT-5.6 Luna** (50% off) for simple tasks like SEO and moderation
3. **Uses Claude 3.5 Sonnet** for complex tasks like blog content
4. **Tracks costs** and shows your savings
5. **Handles fallbacks** automatically if a model fails

## 💰 Cost Savings

### Before (All Claude)
- SEO meta generation: **$0.009** per 1000 tokens
- Comment moderation: **$0.009** per 1000 tokens
- Blog generation: **$0.009** per 1000 tokens

### After (Smart Routing)
- SEO meta generation: **$0.00035** per 1000 tokens (Luna) ✅ 94% savings
- Comment moderation: **$0.00035** per 1000 tokens (Luna) ✅ 94% savings
- Blog generation: **$0.009** per 1000 tokens (Claude) ✅ Quality maintained

### Real-World Example
**10,000 requests/month:**
- Before: $90.00 (all Claude)
- After: $35.00 (smart routing)
- **Annual savings: $660** 💸

## 📋 Quick Setup

### 1. Get OpenRouter API Key

```bash
# Visit: https://openrouter.ai/keys
# Sign up and create an API key
```

### 2. Configure Environment

```bash
# Copy the template
cp .env.router.example .env.local

# Edit .env.local and add:
OPENROUTER_API_KEY=your_key_here
MODEL_ROUTER_STRATEGY=cost-optimized
```

### 3. Test the Connection

```typescript
import { testConnection } from '@/lib/openrouter-client';

const isConnected = await testConnection();
console.log('OpenRouter connected:', isConnected);
```

## 🔧 Usage Examples

### Basic Usage

```typescript
import { routeRequest } from '@/lib/model-router';

// Generate SEO meta (automatically uses Luna - cheap!)
const seoMeta = await routeRequest({
  taskType: 'seo-meta',
  prompt: 'Generate SEO meta for article about DICloak browser',
});

console.log(seoMeta.content);    // The generated meta
console.log(seoMeta.model);      // "openai/gpt-5.6-luna"
console.log(seoMeta.cost);       // ~$0.00035
console.log(seoMeta.duration);   // Time in ms
```

### Blog Generation

```typescript
// Generate blog content (automatically uses Claude - quality!)
const blogContent = await routeRequest({
  taskType: 'blog-generation',
  prompt: 'Write a comprehensive review of DICloak antidetect browser',
  systemPrompt: 'You are a tech blogger writing detailed, SEO-optimized content.',
  maxTokens: 4000,
});

console.log(blogContent.content); // High-quality blog post
console.log(blogContent.model);   // "anthropic/claude-3.5-sonnet"
console.log(blogContent.cost);    // ~$0.036 for quality content
```

### Comment Moderation

```typescript
// Moderate comment (automatically uses Luna - fast & cheap!)
const moderation = await routeRequest({
  taskType: 'comment-moderation',
  prompt: `Is this comment spam or inappropriate? "${userComment}"`,
  temperature: 0.1, // Low temperature for consistent results
});

const isSpam = moderation.content.toLowerCase().includes('spam');
```

### SEO Meta Generation

```typescript
// Generate SEO meta tags
const meta = await routeRequest({
  taskType: 'seo-meta',
  prompt: `Generate SEO meta for: ${articleTitle}`,
});

// Parse the response and use in your blog
const metaTags = JSON.parse(meta.content);
```

## 📊 Cost Tracking

### View Stats via API

```bash
# Get current statistics
curl http://localhost:3000/api/router-stats

# Response:
{
  "success": true,
  "data": {
    "totalCost": 2.45,
    "requestCount": 150,
    "savingsVsAllClaude": 11.30,
    "metrics": {
      "avgCostPerRequest": 0.0163,
      "savingsPercentage": 82.2,
      "totalSpent": 2.45,
      "totalSaved": 11.30
    }
  }
}
```

### View Stats in Code

```typescript
import { getCostTracker } from '@/lib/model-router';

const stats = getCostTracker();

console.log(`Total spent: $${stats.totalCost.toFixed(2)}`);
console.log(`Total saved: $${stats.savingsVsAllClaude.toFixed(2)}`);
console.log(`Requests: ${stats.requestCount}`);

// Breakdown by model
Object.entries(stats.breakdown).forEach(([model, data]) => {
  console.log(`${model}:`);
  console.log(`  Requests: ${data.requests}`);
  console.log(`  Cost: $${data.cost.toFixed(4)}`);
  console.log(`  Tokens: ${data.tokens}`);
});
```

### Reset Stats

```bash
# Via API
curl -X DELETE http://localhost:3000/api/router-stats

# Or in code
import { resetCostTracker } from '@/lib/model-router';
resetCostTracker();
```

## 🎯 Task Types & Routing

The router automatically selects the best model based on task type:

### Uses Luna (Cost-Optimized) 💰

| Task Type | Use Case | Model | Cost/1K tokens |
|-----------|----------|-------|----------------|
| `seo-meta` | Generate SEO tags | GPT-5.6 Luna | $0.00035 |
| `comment-moderation` | Filter spam/inappropriate | GPT-5.6 Luna | $0.00035 |
| `data-extraction` | Extract structured data | GPT-5.6 Luna | $0.00035 |
| `simple-classification` | Yes/no, category selection | GPT-5.6 Luna | $0.00035 |

### Uses Claude (Quality-First) 🎨

| Task Type | Use Case | Model | Cost/1K tokens |
|-----------|----------|-------|----------------|
| `blog-generation` | Write articles | Claude 3.5 Sonnet | $0.009 |
| `code-generation` | Generate code | Claude 3.5 Sonnet | $0.009 |
| `complex-analysis` | Deep analysis | Claude 3.5 Sonnet | $0.009 |
| `creative-writing` | Creative content | Claude 3.5 Sonnet | $0.009 |

## ⚙️ Configuration

### Change Strategy

```bash
# In .env.local
MODEL_ROUTER_STRATEGY=cost-optimized  # Default - max savings
# MODEL_ROUTER_STRATEGY=quality-first   # All Claude
# MODEL_ROUTER_STRATEGY=balanced        # Mix
```

### Customize Routes

Edit `src/config/model-routes.json`:

```json
{
  "routes": {
    "my-custom-task": {
      "model": "openai/gpt-5.6-luna",
      "provider": "openrouter",
      "reason": "Simple task, cost-optimized",
      "fallback": "anthropic/claude-3.5-sonnet",
      "maxTokens": 500,
      "temperature": 0.3
    }
  }
}
```

## 🔌 Integration Examples

### 1. Blog Post Generation

```typescript
// In your blog creation API
export async function POST(req: Request) {
  const { title, outline } = await req.json();
  
  const result = await routeRequest({
    taskType: 'blog-generation',
    prompt: `Write a blog post:\nTitle: ${title}\nOutline: ${outline}`,
    maxTokens: 4000,
  });
  
  // Save to database
  await db.posts.create({
    title,
    content: result.content,
    aiCost: result.cost,
    aiModel: result.model,
  });
  
  return Response.json({ success: true });
}
```

### 2. SEO Meta Generation

```typescript
// Generate SEO meta for all posts
async function generateSEOMeta(post: Post) {
  const result = await routeRequest({
    taskType: 'seo-meta',
    prompt: `Generate SEO meta tags for:\nTitle: ${post.title}\nContent: ${post.excerpt}`,
  });
  
  const meta = JSON.parse(result.content);
  
  await db.posts.update(post.id, {
    metaTitle: meta.title,
    metaDescription: meta.description,
  });
}
```

### 3. Comment Moderation

```typescript
// Auto-moderate comments
export async function POST(req: Request) {
  const { comment } = await req.json();
  
  const result = await routeRequest({
    taskType: 'comment-moderation',
    prompt: `Analyze this comment for spam/inappropriate content: "${comment}"`,
    temperature: 0.1,
  });
  
  const approved = !result.content.toLowerCase().includes('inappropriate');
  
  await db.comments.create({
    content: comment,
    approved,
    moderationCost: result.cost, // Track per-comment cost
  });
  
  return Response.json({ approved });
}
```

## 🧪 Testing

### Test Different Strategies

```typescript
import { modelRouter } from '@/lib/model-router';

const comparison = await modelRouter.testRoute(
  'seo-meta',
  'Generate SEO meta for DICloak review'
);

console.log(comparison.comparison);
// Output:
// Cost Optimized: openai/gpt-5.6-luna - $0.0004
// Quality First: anthropic/claude-3.5-sonnet - $0.0090
// Savings: $0.0086 (95.6%)
```

### Get Recommendations

```typescript
import { modelRouter } from '@/lib/model-router';

const recommendation = modelRouter.getRecommendation('blog-generation');
console.log(recommendation);
// "High quality content creation requires advanced reasoning and creativity"
```

## 📈 Monitoring

### Daily Cost Report

```typescript
import { getCostTracker } from '@/lib/model-router';

function generateDailyReport() {
  const stats = getCostTracker();
  
  return `
📊 Daily AI Cost Report
━━━━━━━━━━━━━━━━━━━━
Requests: ${stats.requestCount}
Total Spent: $${stats.totalCost.toFixed(2)}
Saved: $${stats.savingsVsAllClaude.toFixed(2)}
Savings: ${((stats.savingsVsAllClaude / (stats.totalCost + stats.savingsVsAllClaude)) * 100).toFixed(1)}%

Model Breakdown:
${Object.entries(stats.breakdown).map(([model, data]) => 
  `  ${model}: ${data.requests} req, $${data.cost.toFixed(4)}`
).join('\n')}
  `;
}
```

## 🎓 Best Practices

### 1. Match Task to Model

```typescript
// ❌ Don't use Claude for simple tasks
await routeRequest({
  taskType: 'blog-generation', // Uses Claude
  prompt: 'Is this spam? Yes or no.',
});

// ✅ Use appropriate task type
await routeRequest({
  taskType: 'simple-classification', // Uses Luna
  prompt: 'Is this spam? Yes or no.',
});
```

### 2. Set Appropriate Temperatures

```typescript
// For consistent output (classification, extraction)
temperature: 0.0 - 0.3

// For balanced output (SEO, summaries)
temperature: 0.3 - 0.7

// For creative output (blog posts, stories)
temperature: 0.7 - 1.0
```

### 3. Handle Errors with Fallback

The router automatically handles fallbacks, but you can add your own:

```typescript
try {
  const result = await routeRequest({
    taskType: 'blog-generation',
    prompt: myPrompt,
  });
  return result.content;
} catch (error) {
  console.error('Primary and fallback failed:', error);
  // Use cached content or default
  return getCachedContent();
}
```

### 4. Track Costs Per Feature

```typescript
// Track costs by feature
const costs = {
  blogGeneration: 0,
  seoMeta: 0,
  moderation: 0,
};

const result = await routeRequest({ taskType, prompt });
costs[taskType] += result.cost;

// Analyze which features cost most
console.log('Most expensive feature:', 
  Object.keys(costs).reduce((a, b) => costs[a] > costs[b] ? a : b)
);
```

## 🚀 Advanced Features

### Streaming Responses

```typescript
import { openRouterClient } from '@/lib/openrouter-client';

// Stream for real-time UI updates
for await (const chunk of openRouterClient.streamComplete({
  model: 'anthropic/claude-3.5-sonnet',
  messages: [{ role: 'user', content: 'Write a story...' }],
})) {
  process.stdout.write(chunk); // Print in real-time
}
```

### Custom Model Selection

```typescript
import { openRouterClient } from '@/lib/openrouter-client';

// Bypass router for specific use case
const response = await openRouterClient.complete({
  model: 'openai/gpt-5.6-luna',
  messages: [{ role: 'user', content: 'Quick question...' }],
  maxTokens: 100,
});
```

## 💡 Tips

1. **Start with cost-optimized** - You can always switch to quality-first later
2. **Monitor your stats** - Check `/api/router-stats` weekly
3. **Customize routes** - Adjust `model-routes.json` based on your needs
4. **Use Luna for dev/testing** - Save Claude credits for production
5. **Track per-feature costs** - Identify expensive operations

## 🔗 Resources

- **OpenRouter Dashboard**: https://openrouter.ai/
- **Model Pricing**: https://openrouter.ai/models
- **GPT-5.6 Luna Docs**: https://openrouter.ai/models/openai/gpt-5.6-luna
- **Claude Docs**: https://docs.anthropic.com/

## 🆘 Troubleshooting

### "OpenRouter API key not configured"

```bash
# Make sure .env.local has:
OPENROUTER_API_KEY=sk-or-v1-...
```

### High Costs

```typescript
// Check which tasks cost most
const stats = getCostTracker();
const sorted = Object.entries(stats.breakdown)
  .sort((a, b) => b[1].cost - a[1].cost);
  
console.log('Most expensive:', sorted[0]);
// Consider using Luna for that task type
```

### Models Not Switching

```bash
# Verify strategy is set
echo $MODEL_ROUTER_STRATEGY

# Should be: cost-optimized
# If not, add to .env.local
```

## 📊 Example: Month-to-Month Savings

```
Month 1 (Before Router):
- 5,000 SEO generations: $45.00
- 10,000 comment checks: $90.00
- 500 blog posts: $45.00
Total: $180.00

Month 1 (With Router):
- 5,000 SEO generations (Luna): $1.75 ✅
- 10,000 comment checks (Luna): $3.50 ✅
- 500 blog posts (Claude): $45.00
Total: $50.25

💰 Saved: $129.75/month = $1,557/year
```

---

## ✅ Ready to Use!

Your smart model router is now configured. Simply use `routeRequest()` in your code and it will automatically:

1. Choose the right model
2. Save money where possible
3. Maintain quality where needed
4. Track all costs
5. Handle errors gracefully

**Start saving now! 🎉**
