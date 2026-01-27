# Quick Start: AI Trading Assistant

## The Issue

You're seeing this error:
```
AI Gateway requires a valid credit card on file to service requests
```

## Two Solutions

### ✅ Option 1: Use OpenAI Directly (Fastest)

**No credit card needed on Vercel!**

1. **Get OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to .env**
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Comment out Gateway key**
   ```env
   # AI_GATEWAY_API_KEY=vck_your_gateway_key_here
   ```

4. **Restart server**
   ```bash
   npm run dev
   ```

**Cost:** ~$0.02 per conversation with GPT-4 Turbo

---

### ✅ Option 2: Add Credit Card to Vercel (More Features)

**Get access to 100+ AI models!**

1. **Add Credit Card**
   - Visit: https://vercel.com/account/billing
   - Add a valid credit card
   - You'll get free credits to start

2. **Keep Gateway key in .env**
   ```env
   AI_GATEWAY_API_KEY=vck_your_actual_key_here
   ```

3. **Restart server**
   ```bash
   npm run dev
   ```

**Benefits:**
- Access to OpenAI, Anthropic, Google, Meta models
- Automatic fallbacks
- Built-in monitoring
- No token markup

---

## Comparison

| Feature | OpenAI Direct | Vercel Gateway |
|---------|--------------|----------------|
| Setup Time | 5 minutes | 5 minutes + credit card |
| Available Models | OpenAI only | 100+ models |
| Cost | Direct billing | Same cost, no markup |
| Monitoring | Manual | Built-in dashboard |
| Fallbacks | Manual | Automatic |
| Credit Card | On OpenAI | On Vercel |

---

## Recommended Approach

### For Development (Now):
Use **Option 1** (OpenAI Direct) - fastest to get started

### For Production (Later):
Switch to **Option 2** (Vercel Gateway) - better features and monitoring

---

## Testing

After setup, test the AI assistant:

1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/trading-assistant
3. Ask: "Analyze Bitcoin price trend"
4. Should get a response!

---

## Troubleshooting

### "Invalid API key" with OpenAI
- Check key starts with `sk-`
- Verify it's active in OpenAI dashboard
- Make sure you have credits in OpenAI account

### "Credit card required" with Gateway
- Add credit card at https://vercel.com/account/billing
- Or switch to OpenAI Direct (Option 1)

### Still not working?
- Check `.env` file is in root directory
- Restart your dev server
- Check browser console for errors
- Verify API key is not expired

---

## Your Current Setup

```env
✅ Gateway Key: Available (configured in .env)
⚠️  Requires: Credit card on Vercel account
💡 Alternative: Use OPENAI_API_KEY instead
```

**Choose your option above and get started!** 🚀
