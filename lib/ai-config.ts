import { createOpenAI } from '@ai-sdk/openai';
import { createGateway } from 'ai';

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

// Get AI Gateway API key from environment
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;

// Check if we should use AI Gateway
const USE_AI_GATEWAY = !!AI_GATEWAY_API_KEY;

// Create provider based on configuration
const getProvider = () => {
  // Check for OpenAI API key first (direct access)
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (OPENAI_API_KEY) {
    // Use direct OpenAI API
    console.log('✅ Using Direct OpenAI API');
    return createOpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }
  
  if (USE_AI_GATEWAY) {
    // Use Vercel AI Gateway - unified access to all providers
    console.log('✅ Using Vercel AI Gateway');
    console.log('⚠️  Note: Vercel AI Gateway requires a credit card on file');
    console.log('   Visit: https://vercel.com/account/billing to add one');
    return createGateway({
      apiKey: AI_GATEWAY_API_KEY,
    });
  }
  
  console.error('❌ No API key found!');
  console.error('   Option 1: Add OPENAI_API_KEY to .env (get from https://platform.openai.com/api-keys)');
  console.error('   Option 2: Add credit card to Vercel and use AI_GATEWAY_API_KEY');
  throw new Error('Missing API key: Set OPENAI_API_KEY or AI_GATEWAY_API_KEY in .env');
};

export const aiProvider = getProvider();

export const AI_MODELS = {
  // OpenAI Models (works with both direct API and Gateway)
  GPT4_TURBO: 'gpt-4-turbo',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
  GPT4O: 'gpt-4o',
  
  // Gateway-only models (require AI Gateway with credit card)
  CLAUDE_SONNET: 'anthropic/claude-sonnet-4.5',
  CLAUDE_OPUS: 'anthropic/claude-opus-4',
  GEMINI_FLASH: 'google/gemini-2.0-flash',
  GEMINI_PRO: 'google/gemini-2.0-pro',
} as const;

export const AI_CONFIG = {
  // Default model to use
  defaultModel: AI_MODELS.GPT4_TURBO,
  
  // Temperature: 0 = deterministic, 1 = creative
  // For trading analysis, we want balanced creativity
  temperature: 0.7,
  
  // Maximum tokens in response
  maxTokens: 1000,
  
  // Top P: nucleus sampling parameter
  topP: 1,
  
  // Frequency penalty: reduce repetition
  frequencyPenalty: 0,
  
  // Presence penalty: encourage new topics
  presencePenalty: 0,
} as const;

/**
 * Get configured AI model instance
 * 
 * With AI Gateway, you can use models from multiple providers:
 * - OpenAI: openai/gpt-4-turbo, openai/gpt-4o
 * - Anthropic: anthropic/claude-sonnet-4.5
 * - Google: google/gemini-2.0-flash
 * - And many more!
 */
export function getAIModel(modelName?: string) {
  const model = modelName || AI_CONFIG.defaultModel;
  
  if (USE_AI_GATEWAY) {
    // When using gateway, return the model string directly
    // The gateway provider handles model creation
    return aiProvider(model);
  }
  
  // For direct OpenAI, use the provider
  return aiProvider(model);
}

/**
 * Cost estimation per 1K tokens (approximate)
 */
export const MODEL_COSTS = {
  [AI_MODELS.GPT4_TURBO]: {
    input: 0.01,  // $0.01 per 1K input tokens
    output: 0.03, // $0.03 per 1K output tokens
  },
  [AI_MODELS.GPT4]: {
    input: 0.03,
    output: 0.06,
  },
  [AI_MODELS.GPT35_TURBO]: {
    input: 0.0005,
    output: 0.0015,
  },
  [AI_MODELS.GPT4O]: {
    input: 0.005,
    output: 0.015,
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
  
  const inputCost = (inputTokens / 1000) * costs.input;
  const outputCost = (outputTokens / 1000) * costs.output;
  
  return inputCost + outputCost;
}

/**
 * System prompts for different use cases
 */
export const SYSTEM_PROMPTS = {
  TRADING_ASSISTANT: `You are an expert cryptocurrency trading assistant with deep knowledge of technical analysis, market trends, and blockchain technology. Your role is to:

1. Analyze cryptocurrency price data and provide technical insights
2. Explain trading concepts in clear, accessible language
3. Provide data-driven predictions based on historical patterns
4. Help users understand market indicators (RSI, MACD, Moving Averages, etc.)
5. Offer risk management advice and trading strategies
6. Stay objective and always mention that crypto trading involves risk

When analyzing coins:
- Use technical indicators to support your analysis
- Reference current price trends and patterns
- Explain your reasoning clearly
- Provide actionable insights while emphasizing risk management
- Never guarantee profits or specific outcomes

You have access to real-time cryptocurrency data and can perform technical analysis on any coin. Be conversational, helpful, and educational.`,

  PORTFOLIO_ADVISOR: `You are a cryptocurrency portfolio advisor specializing in risk management and diversification strategies. Help users build balanced portfolios based on their risk tolerance and investment goals.`,

  MARKET_ANALYST: `You are a cryptocurrency market analyst focused on macro trends, market sentiment, and fundamental analysis. Provide insights on market movements and long-term trends.`,

  TECHNICAL_EDUCATOR: `You are a technical analysis educator. Explain complex trading concepts in simple terms and help users understand how to use various indicators and chart patterns.`,
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
