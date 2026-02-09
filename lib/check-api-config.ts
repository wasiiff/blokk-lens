/**
 * Check if AI API is properly configured
 */
export function checkAIConfig(): {
  isConfigured: boolean;
  provider: 'vercel-gateway' | 'openai' | 'google' | 'none';
  message: string;
} {
  const hasGatewayKey = !!process.env.AI_GATEWAY_API_KEY;
  const hasGoogleKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  if (hasGatewayKey) {
    return {
      isConfigured: true,
      provider: 'vercel-gateway',
      message: '✅ Using Vercel AI Gateway',
    };
  }

  if (hasGoogleKey) {
    return {
      isConfigured: true,
      provider: 'google',
      message: '✅ Using Google Generative AI (Gemini)',
    };
  }

  if (hasOpenAIKey) {
    return {
      isConfigured: true,
      provider: 'openai',
      message: '✅ Using Direct OpenAI API',
    };
  }

  return {
    isConfigured: false,
    provider: 'none',
    message: '❌ No AI API key configured. Please set AI_GATEWAY_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENAI_API_KEY.',
  };
}

/**
 * Get helpful setup instructions
 */
export function getSetupInstructions(): string {
  return `
To fix this:

Option 1 (RECOMMENDED): Vercel AI Gateway
1. Go to Vercel Dashboard → Your Project → AI Gateway
2. Create an API key (starts with vck_)
3. Add to .env: AI_GATEWAY_API_KEY=vck_your_key_here
4. Restart your app

Option 2: Google Generative AI (Gemini)
1. Go to Google AI Studio
2. Create an API key
3. Add to .env: GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
4. Restart your app

Option 3: Direct OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create an API key (starts with sk-)
3. Add to .env: OPENAI_API_KEY=sk-your_key_here
4. Restart your app

See docs/API_KEY_SETUP.md for detailed instructions.
  `.trim();
}
