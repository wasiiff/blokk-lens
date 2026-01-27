# Vercel AI Gateway Configuration Guide

## ✅ Your Setup is Ready!

Your Vercel AI Gateway is configured and ready to use!

```env
AI_GATEWAY_API_KEY=vck_your_actual_key_here
```

**Note:** Replace `vck_your_actual_key_here` with your real key from Vercel Dashboard.

## What is Vercel AI Gateway?

Vercel AI Gateway is a **unified API** that gives you access to **100+ AI models** from multiple providers through a single endpoint.

### Key Benefits:

✅ **One Key, Many Models** - Access OpenAI, Anthropic, Google, Meta, xAI, and more  
✅ **Automatic Fallbacks** - If one provider fails, automatically tries another  
✅ **No Token Markup** - Same cost as going direct to providers  
✅ **Built-in Monitoring** - Track usage, costs, and performance  
✅ **Rate Limiting** - Automatic protection against overuse  
✅ **Caching** - Faster responses for repeated queries  

## How It Works

```
Your App → AI Gateway (vck_ key) → Multiple AI Providers
                                   ├─ OpenAI
                                   ├─ Anthropic
                                   ├─ Google
                                   └─ Others
```

The gateway handles:
- Authentication with providers
- Load balancing
- Automatic retries
- Cost tracking
- Usage analytics

## Available Models

With your gateway key, you can use:

### OpenAI Models
- `openai/gpt-4-turbo` - Best quality
- `openai/gpt-4o` - Optimized for speed
- `openai/gpt-3.5-turbo` - Fast and cheap

### Anthropic Models
- `anthropic/claude-sonnet-4.5` - Latest Claude
- `anthropic/claude-opus-4` - Most capable

### Google Models
- `google/gemini-2.0-flash` - Fast and efficient
- `google/gemini-2.0-pro` - High quality

### And Many More!
- Meta Llama models
- xAI Grok models
- Mistral models
- DeepSeek models
- And 100+ others!

## Setup Steps (Already Done!)

Your configuration is complete:

1. ✅ Gateway key added to `.env`
2. ✅ Code configured in `lib/ai-config.ts`
3. ✅ AI SDK installed (`ai` package)

## Testing Your Setup

Start your development server:

```bash
npm run dev
```

Visit the Trading Assistant at `http://localhost:3000/trading-assistant` and ask a question!

## Adding Provider Keys (Optional - BYOK)

You can add your own provider API keys in Vercel Dashboard for:
- Lower costs (direct billing)
- Higher rate limits
- Access to private models

### How to Add Provider Keys:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **AI Gateway** → **Settings**
4. Click **"Bring Your Own Key"**
5. Add your provider API keys (OpenAI, Anthropic, etc.)

**Note:** This is optional! The gateway works without provider keys, but you'll be billed through Vercel.

## Switching Models

You can easily switch between models in your code:

```typescript
// In lib/ai-config.ts
export const AI_CONFIG = {
  // Change this to switch models
  defaultModel: AI_MODELS.GPT4_TURBO,        // OpenAI GPT-4 Turbo
  // defaultModel: AI_MODELS.CLAUDE_SONNET,  // Anthropic Claude
  // defaultModel: AI_MODELS.GEMINI_FLASH,   // Google Gemini
  
  temperature: 0.7,
  maxTokens: 1000,
}
```

## Cost Tracking

Monitor your usage in Vercel Dashboard:
- View requests per model
- Track costs in real-time
- Set spending limits
- Get usage alerts

## Fallback Configuration

The gateway automatically handles fallbacks, but you can configure them:

```typescript
// In your API route
const result = await generateText({
  model: 'openai/gpt-4-turbo',
  prompt: 'Your prompt',
  providerOptions: {
    gateway: {
      // Try these models in order if primary fails
      models: ['anthropic/claude-sonnet-4.5', 'google/gemini-2.0-flash'],
    },
  },
});
```

## Rate Limiting

The gateway includes automatic rate limiting:
- Protects against overuse
- Prevents unexpected costs
- Configurable in Vercel Dashboard

## Troubleshooting

### Error: "Invalid API key"

**Check:**
1. Your gateway key starts with `vck_`
2. The key is correctly set in `.env`
3. You've restarted your dev server

### Error: "Model not found"

**Solution:** Use the correct model format:
- ✅ `openai/gpt-4-turbo`
- ❌ `gpt-4-turbo`

### Gateway not working?

**Steps:**
1. Verify your key in Vercel Dashboard
2. Check if the key is active
3. Look at browser console for errors
4. Check Vercel Dashboard for usage/errors

## Advanced Features

### Usage Tracking by User

Track usage per end-user:

```typescript
const result = await generateText({
  model: 'openai/gpt-4-turbo',
  prompt: 'Your prompt',
  providerOptions: {
    gateway: {
      user: 'user-123',  // Track by user ID
      tags: ['chat', 'v2'],  // Categorize requests
    },
  },
});
```

### Zero Data Retention

Ensure privacy by using only providers with zero data retention:

```typescript
providerOptions: {
  gateway: {
    zeroDataRetention: true,
  },
}
```

### Provider Routing

Control which providers to use:

```typescript
providerOptions: {
  gateway: {
    only: ['anthropic', 'openai'],  // Only use these providers
    order: ['anthropic', 'openai'],  // Try in this order
  },
}
```

## Cost Comparison

### With Gateway (Your Current Setup)
- ✅ No upfront costs
- ✅ Pay only for what you use
- ✅ Billed through Vercel
- ✅ Automatic cost tracking

### With BYOK (Optional)
- ✅ Direct provider billing
- ✅ Potentially lower costs
- ✅ Higher rate limits
- ⚠️ Requires provider accounts

## Security Best Practices

1. ✅ Never commit `.env` to git
2. ✅ Use environment variables in production
3. ✅ Rotate keys regularly
4. ✅ Monitor usage for anomalies
5. ✅ Set spending limits in Vercel Dashboard

## Next Steps

Your AI Gateway is ready! Here's what you can do:

1. **Test it** - Start your dev server and try the Trading Assistant
2. **Monitor usage** - Check Vercel Dashboard for analytics
3. **Try different models** - Switch between OpenAI, Anthropic, Google
4. **Add BYOK** (optional) - Add your provider keys for lower costs
5. **Set limits** - Configure spending limits in Vercel Dashboard

## Resources

- [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Available Models](https://vercel.com/docs/ai-gateway/models)
- [BYOK Setup](https://vercel.com/docs/ai-gateway/byok)

---

## Your Current Configuration

```env
✅ AI_GATEWAY_API_KEY=vck_your_key_here (configured in .env)
✅ Default Model: openai/gpt-4-turbo
✅ Fallback: Automatic (handled by gateway)
✅ Monitoring: Enabled in Vercel Dashboard
```

**You're all set! Start your dev server and test the AI assistant!** 🚀
