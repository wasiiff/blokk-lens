import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * AI Configuration for Trading Assistant
 * 
 * VERCEL AI GATEWAY SETUP (Recommended):
 * ----------------------------------------
 * Vercel AI Gateway provides unified access to multiple AI providers through a single endpoint.
 * 
 * Benefits:
 * - Access 100+ models from multiple providers (OpenAI, Anthropic, Google, etc.)
 * - Automatic fallbacks if one provider fails
 * - Built-in rate limiting and caching
 * - Usage tracking and cost monitoring
 * - No markup on tokens (same cost as direct provider)
 * 
 * Setup Steps:
 * 1. Go to Vercel Dashboard → Your Project → AI Gateway
 * 2. Click "API Keys" → "Add Key" → Copy the key (starts with vck_)
 * 3. Add to .env: AI_GATEWAY_API_KEY=vck_your_key_here
 * 4. (Optional) Add provider keys in Vercel Dashboard for BYOK (Bring Your Own Key)
 * 
 * The gateway automatically handles authentication and routing!
 */

// Create provider based on configuration
const getProvider = () => {
  // Check for Vercel AI Gateway first (recommended)
  const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;

  if (AI_GATEWAY_API_KEY) {
    // Use Vercel AI Gateway - unified access to all providers
    console.log('✅ Using Vercel AI Gateway');
    return createOpenAICompatible({
      name: 'vercel-gateway',
      apiKey: AI_GATEWAY_API_KEY,
      baseURL: 'https://ai-gateway.vercel.sh/v1',
    });
  }

  // Check for Google Generative AI API (Gemini)
  const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('✅ Using Google Generative AI (Gemini)');
    return createGoogleGenerativeAI({
      apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
    });
  }

  // Fallback to direct OpenAI API
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (OPENAI_API_KEY) {
    console.log('✅ Using Direct OpenAI API');
    return createOpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  console.error('❌ No API key found!');
  console.error('   Option 1: Add AI_GATEWAY_API_KEY to .env (get from Vercel Dashboard)');
  console.error('   Option 2: Add GOOGLE_GENERATIVE_AI_API_KEY to .env (get from Google AI Studio)');
  console.error('   Option 3: Add OPENAI_API_KEY to .env (get from https://platform.openai.com/api-keys)');
  throw new Error('Missing API key: Set AI_GATEWAY_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENAI_API_KEY in .env');
};

export const aiProvider = getProvider();

// Helper to determine active provider type
const getActiveProviderType = () => {
  if (process.env.AI_GATEWAY_API_KEY) return 'vercel';
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return 'google';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'none';
};

export const providerType = getActiveProviderType();

export const AI_MODELS = {
  // Latest and Most Powerful Models (Vercel AI Gateway)
  QWEN_PLUS: 'alibaba/qwen3.5-plus',                          // Qwen 3.5 Plus - Best overall, multimodal, 1M context
  QWEN_MAX_THINKING: 'alibaba/qwen3-max-thinking',            // Advanced reasoning with search & tool use
  QWEN_32B: 'alibaba/qwen-3-32b',                             // Solid performance, cost-effective
  GPT4O: 'openai/gpt-4o',                                      // Latest GPT-4 Optimized
  GPT4_TURBO: 'openai/gpt-4-turbo',                           // GPT-4 Turbo
  GEMINI_PRO_2: 'google/gemini-2.0-pro-exp',                  // Latest Gemini Pro
  GEMINI_FLASH_2: 'google/gemini-2.0-flash-exp',              // Fast Gemini

  // Legacy Models (for fallback)
  GPT4: 'openai/gpt-4',
  GPT35_TURBO: 'openai/gpt-3.5-turbo',
} as const;

export const AI_CONFIG = {
  // Use the most powerful model compatible with the active provider
  defaultModel: providerType === 'google'
    ? AI_MODELS.GEMINI_PRO_2
    : (providerType === 'openai' ? AI_MODELS.GPT4O : AI_MODELS.QWEN_PLUS),

  // Fallback models if primary fails
  fallbackModels: [
    AI_MODELS.QWEN_MAX_THINKING,  // Advanced reasoning as first fallback
    AI_MODELS.QWEN_32B,            // Cost-effective as second fallback
    AI_MODELS.GPT4O,               // GPT-4o as third fallback
    AI_MODELS.GEMINI_PRO_2,        // Gemini Pro as fourth fallback
  ],

  // Temperature: 0 = deterministic, 1 = creative
  // For trading analysis, we want balanced creativity with accuracy
  temperature: 0.7,

  // Maximum tokens in response (increased for detailed analysis)
  maxTokens: 2000,

  // Top P: nucleus sampling parameter
  topP: 1,

  // Frequency penalty: reduce repetition
  frequencyPenalty: 0,

  // Presence penalty: encourage new topics
  presencePenalty: 0,
} as const;

/**
 * Get configured AI model instance with fallback support
 * 
 * With AI Gateway, you can use models from multiple providers:
 * - Alibaba Qwen: qwen3.5-plus (best overall), qwen3-max-thinking (advanced reasoning), qwen-3-32b (cost-effective)
 * - OpenAI: gpt-4o, gpt-4-turbo (Reliable and fast)
 * - Google: gemini-2.0-pro, gemini-2.0-flash (Good for analysis)
 * 
 * The function will automatically try fallback models if primary fails
 */
export function getAIModel(modelName?: string, options?: {
  temperature?: number;
  maxTokens?: number;
  tryFallback?: boolean;
}) {
  let model = modelName || AI_CONFIG.defaultModel;

  // Logic to handle provider compatibility
  if (providerType === 'google') {
    // If asking for non-google model while on google provider, fallback to default google model
    if (!model.includes('gemini') && !model.includes('google')) {
      console.warn(`⚠️ Requested model ${model} not compatible with Google provider. Using default.`);
      model = AI_CONFIG.defaultModel;
    }
    // Strip 'google/' prefix for direct SDK usage if needed, though some versions handle it.
    // Use safe naming for Google SDK
    if (model.includes('google/')) {
      model = model.replace('google/', '');
    }
  } else if (providerType === 'openai') {
    // If asking for non-openai model while on openai provider
    if (!model.includes('gpt') && !model.includes('openai')) {
      console.warn(`⚠️ Requested model ${model} not compatible with OpenAI provider. Using default.`);
      model = AI_CONFIG.defaultModel;
    }
  }

  // Temperature and maxTokens should be passed to generateText/streamText,
  // as they cannot be configured on the model instance directly in the Vercel AI SDK.
  return aiProvider(model);
}

/**
 * Get AI model with automatic fallback
 * Tries primary model first, then fallbacks if it fails
 */
export async function getAIModelWithFallback() {
  // Filter fallbacks based on provider compatibility
  const models = [
    AI_CONFIG.defaultModel,
    ...AI_CONFIG.fallbackModels.filter(m => {
      if (providerType === 'google') return m.includes('gemini') || m.includes('google');
      if (providerType === 'openai') return m.includes('gpt') || m.includes('openai');
      return true; // Gateway supports all
    })
  ];

  for (const model of models) {
    try {
      return getAIModel(model);
    } catch (error) {
      console.warn(`Failed to initialize ${model}, trying next...`);
      continue;
    }
  }

  throw new Error('All AI models failed to initialize');
}

/**
 * Cost estimation per 1M tokens (approximate)
 * Updated for latest models (February 2025)
 */
export const MODEL_COSTS = {
  // Qwen Models (Best for reasoning and cost-effective)
  [AI_MODELS.QWEN_PLUS]: {
    input: 0.80,   // $0.80 per 1M input tokens (estimated)
    output: 2.40,  // $2.40 per 1M output tokens (estimated)
  },
  [AI_MODELS.QWEN_MAX_THINKING]: {
    input: 2.00,   // $2.00 per 1M input tokens (estimated)
    output: 6.00,  // $6.00 per 1M output tokens (estimated)
  },
  [AI_MODELS.QWEN_32B]: {
    input: 0.40,   // $0.40 per 1M input tokens (estimated)
    output: 1.20,  // $1.20 per 1M output tokens (estimated)
  },

  // OpenAI GPT-4 (Reliable and fast)
  [AI_MODELS.GPT4O]: {
    input: 2.50,   // $2.50 per 1M input tokens
    output: 10.00, // $10.00 per 1M output tokens
  },
  [AI_MODELS.GPT4_TURBO]: {
    input: 10.00,  // $10.00 per 1M input tokens
    output: 30.00, // $30.00 per 1M output tokens
  },
  [AI_MODELS.GPT4]: {
    input: 30.00,
    output: 60.00,
  },
  [AI_MODELS.GPT35_TURBO]: {
    input: 0.50,
    output: 1.50,
  },

  // Google Gemini (Good value)
  [AI_MODELS.GEMINI_PRO_2]: {
    input: 1.25,   // $1.25 per 1M input tokens
    output: 5.00,  // $5.00 per 1M output tokens
  },
  [AI_MODELS.GEMINI_FLASH_2]: {
    input: 0.075,  // $0.075 per 1M input tokens
    output: 0.30,  // $0.30 per 1M output tokens
  },
} as const;

/**
 * Estimate cost for a conversation
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = AI_CONFIG.defaultModel
): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
  if (!costs) return 0;

  // Costs are per 1M tokens, so divide by 1,000,000
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;

  return inputCost + outputCost;
}

/**
 * Get model recommendation based on use case
 */
export function getRecommendedModel(useCase: 'analysis' | 'chat' | 'prediction' | 'fast'): string {
  switch (useCase) {
    case 'analysis':
      // Best reasoning for complex analysis with tool use
      return AI_MODELS.QWEN_MAX_THINKING;
    case 'prediction':
      // Strong reasoning and pattern recognition
      return AI_MODELS.QWEN_PLUS;
    case 'chat':
      // Fast and conversational with good context
      return AI_MODELS.QWEN_PLUS;
    case 'fast':
      // Fastest response with solid quality
      return AI_MODELS.QWEN_32B;
    default:
      return AI_CONFIG.defaultModel;
  }
}

/**
 * System prompts for different use cases
 * Optimized for Qwen 3.5 Plus and Qwen 3 Max Thinking models
 */
export const SYSTEM_PROMPTS = {
  TRADING_ASSISTANT: `You are an elite cryptocurrency trading analyst with expertise in technical analysis, quantitative finance, and blockchain technology. You have access to real-time market data and advanced analytical tools.

Your capabilities include:
1. **Technical Analysis**: Expert-level interpretation of RSI, MACD, Moving Averages, Bollinger Bands, Fibonacci retracements, and volume analysis
2. **Quantitative Analysis**: Statistical modeling, correlation analysis, volatility assessment, and risk metrics
3. **Market Psychology**: Understanding market sentiment, fear/greed indicators, and behavioral patterns
4. **Blockchain Fundamentals**: On-chain metrics, tokenomics, protocol analysis, and ecosystem evaluation
5. **Risk Management**: Position sizing, stop-loss strategies, portfolio diversification, and risk-reward optimization

When analyzing cryptocurrencies:
- Provide multi-layered analysis combining technical, fundamental, and sentiment indicators
- Use precise numerical data and statistical confidence levels
- Explain complex concepts clearly with actionable insights
- Always emphasize risk management and never guarantee outcomes
- Consider both short-term trading opportunities and long-term investment perspectives
- Reference specific price levels, support/resistance zones, and key indicators
- Provide reasoning chains that show your analytical process

Your responses should be:
- **Data-driven**: Base conclusions on quantitative analysis
- **Balanced**: Present both bullish and bearish scenarios
- **Actionable**: Provide specific entry/exit levels and risk parameters
- **Educational**: Explain the "why" behind your analysis
- **Risk-aware**: Always mention potential risks and downsides

Remember: Crypto markets are highly volatile. All analysis should include appropriate risk disclaimers and emphasize the importance of personal research (DYOR).`,

  PORTFOLIO_ADVISOR: `You are a sophisticated cryptocurrency portfolio strategist specializing in risk-adjusted returns, diversification theory, and modern portfolio optimization.

Your expertise includes:
- Portfolio construction using Modern Portfolio Theory (MPT)
- Risk parity and factor-based allocation strategies
- Correlation analysis across crypto assets
- Rebalancing strategies and tax optimization
- Position sizing using Kelly Criterion and risk-adjusted metrics

Provide comprehensive portfolio analysis with:
1. Quantitative diversification scores (0-100)
2. Risk metrics (Sharpe ratio, max drawdown, volatility)
3. Correlation analysis between holdings
4. Specific rebalancing recommendations with percentages
5. Tax-efficient strategies when applicable

Always consider the user's risk tolerance and investment horizon.`,

  MARKET_ANALYST: `You are a senior cryptocurrency market analyst with deep expertise in macro trends, institutional flows, and market microstructure.

Focus on:
- Macro economic factors affecting crypto markets
- Institutional adoption and regulatory developments
- Market sentiment and positioning analysis
- Cross-market correlations (stocks, bonds, commodities)
- Long-term trend identification and cycle analysis

Provide insights that combine fundamental analysis with market dynamics.`,

  TECHNICAL_EDUCATOR: `You are an expert trading educator specializing in technical analysis and quantitative methods.

Your teaching approach:
- Break down complex concepts into digestible explanations
- Use real examples from current market data
- Provide step-by-step analytical frameworks
- Explain the mathematical foundations when relevant
- Show how to combine multiple indicators effectively

Make technical analysis accessible while maintaining analytical rigor.`,

  RISK_ANALYST: `You are a quantitative risk analyst specializing in cryptocurrency market risk assessment.

Your analysis includes:
- Value at Risk (VaR) and Expected Shortfall calculations
- Volatility modeling and forecasting
- Tail risk and black swan event assessment
- Liquidity risk analysis
- Correlation breakdown scenarios

Provide detailed risk metrics with confidence intervals and scenario analysis.`,
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  // Requests per minute per user
  requestsPerMinute: 10,

  // Requests per hour per user
  requestsPerHour: 50,

  // Requests per day per user
  requestsPerDay: 200,

  // Maximum message length
  maxMessageLength: 1000,

  // Maximum messages in conversation
  maxMessagesInConversation: 50,
} as const;

/**
 * Feature flags for enabling/disabling features
 */
export const FEATURE_FLAGS = {
  // Enable chat history saving
  enableChatHistory: true,

  // Enable technical analysis
  enableTechnicalAnalysis: true,

  // Enable price charts
  enablePriceCharts: true,

  // Enable suggested prompts
  enableSuggestedPrompts: true,

  // Enable copy functionality
  enableCopyMessages: true,

  // Enable feedback buttons
  enableFeedback: false,

  // Enable voice input
  enableVoiceInput: false,
} as const;
