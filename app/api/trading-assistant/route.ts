import { streamText } from 'ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoinDetails, getCoinMarketChart } from '@/services/coingecko';
import { TradingAnalyzer } from '@/services/trading-analysis';
import { getAIModel, AI_CONFIG } from '@/lib/ai-config';
import { executeTradingAgent } from '@/lib/agents/trading-agent';
import { checkAIConfig, getSetupInstructions } from '@/lib/check-api-config';

// Use Node.js runtime for MongoDB support
export const runtime = 'nodejs';
export const maxDuration = 30;

// Enhanced trading-focused system prompt
const TRADING_SYSTEM_PROMPT = `You are an elite Cryptocurrency Trading Copilot and Technical Analyst. Your goal is to collaborate with the user to find profitable trading opportunities while managing risk.

CORE PERSONALITY:
- You are decisive, professional, and insight-driven.
- You don't just dump data; you interpret it to form a clear **Bias** (Bullish/Bearish/Neutral).
- You proactively suggest **Trade Setups** when the technicals align.
- You speak like a seasoned trader (using terms like "liquidity grab", "retest", "confluence", "risk/reward").

OPERATIONAL RULES:
1. **Be Action-Oriented:** If the user asks about a coin, analyze the technicals and provide a clear outlook.
2. **Suggest Trade Setups:** When you see a clear signal, provide a structured setup:
   - **Direction:** Long 🟢 / Short 🔴
   - **Entry Zone:** Specific price range based on current price/pullbacks.
   - **Stop Loss (SL):** Key invalidation level (e.g., below support/pivot).
   - **Take Profit (TP):** Realistic targets (use Pivot Points/Resistance levels).
   - **Reasoning:** Concise technical justification (e.g., "RSI divergence + bounce off S1 support").
3. **Use the Data:** You have access to real-time indicators (Bollinger Bands, StochRSI, Pivots, MACD). USE THEM.
   - Example: "Price is hugging the lower Bollinger Band and StochRSI is crossing up from 20, suggesting a reversal."
4. **Collaborate:** Ask the user questions to refine the strategy (e.g., "Are you looking for a scalp or a swing trade?", "How conservative is your risk management?").
5. **Risk Disclaimer:** Always imply that these are *theoretical technical setups* and not financial guarantees.

FORMATTING:
- Use **Bold** for key levels and terms.
- Use emojis for visual cues (📈, 📉, 🎯, 🛑).
- Keep responses structured and Scannable.

If the user asks about non-crypto topics, strictly redirect them to trading.`;

// Keywords to detect non-trading queries
const NON_TRADING_KEYWORDS = [
  'recipe', 'cook', 'food', 'weather', 'movie', 'music', 'game', 'sport',
  'joke', 'story', 'poem', 'write code', 'python', 'javascript', 'html',
  'relationship', 'dating', 'love', 'health', 'doctor', 'medicine',
  'travel', 'vacation', 'hotel', 'flight', 'book', 'read',
];

function isNonTradingQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for non-trading keywords
  const hasNonTradingKeyword = NON_TRADING_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword)
  );

  // Check for trading-related context that might override
  const tradingContext = ['crypto', 'bitcoin', 'ethereum', 'trade', 'invest',
    'token', 'coin', 'defi', 'nft', 'blockchain', 'price', 'market', 'chart',
    'rsi', 'macd', 'analysis', 'bull', 'bear', 'portfolio', 'wallet'];

  const hasTradingContext = tradingContext.some(term =>
    lowerMessage.includes(term)
  );

  return hasNonTradingKeyword && !hasTradingContext;
}

async function getMarketContext(coinId?: string) {
  if (!coinId) return null;

  try {
    const [details, chartData] = await Promise.all([
      getCoinDetails(coinId),
      getCoinMarketChart(coinId, 'usd', 30),
    ]);

    const prices = chartData.prices.map((p: [number, number]) => p[1]);
    const indicators = TradingAnalyzer.analyzePriceData(prices);
    const signals = TradingAnalyzer.generateSignals(indicators, prices[prices.length - 1]);

    // Calculate additional metrics
    const priceChange7d = ((prices[prices.length - 1] - prices[prices.length - 8]) / prices[prices.length - 8]) * 100;
    const priceChange30d = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

    return {
      coin: {
        id: details.id,
        symbol: details.symbol,
        name: details.name,
        currentPrice: details.market_data.current_price.usd,
        priceChange24h: details.market_data.price_change_percentage_24h,
        marketCap: details.market_data.market_cap.usd,
        marketCapRank: details.market_data.market_cap_rank,
        volume24h: details.market_data.total_volume.usd,
        high24h: details.market_data.high_24h?.usd,
        low24h: details.market_data.low_24h?.usd,
        ath: details.market_data.ath?.usd,
        athChangePercentage: details.market_data.ath_change_percentage?.usd,
        circulatingSupply: details.market_data.circulating_supply,
        totalSupply: details.market_data.total_supply,
        priceChange7d: priceChange7d || 0,
        priceChange30d: priceChange30d || 0,
      },
      technicalAnalysis: {
        indicators,
        signals,
        priceHistory: prices.slice(-50),
      },
    };
  } catch (error) {
    console.error('Error fetching market context:', error);
    return null;
  }
}

function buildEnhancedPrompt(marketContext: any): string {
  let enhancedPrompt = TRADING_SYSTEM_PROMPT;

  if (marketContext) {
    const coin = marketContext.coin;
    const indicators = marketContext.technicalAnalysis.indicators;
    const signals = marketContext.technicalAnalysis.signals;

    enhancedPrompt += `\n\n## Current Market Data for ${coin.name} (${coin.symbol.toUpperCase()})

### Price Information
- **Current Price:** $${coin.currentPrice.toLocaleString()}
- **24h Change:** ${coin.priceChange24h >= 0 ? '+' : ''}${coin.priceChange24h.toFixed(2)}%
- **7d Change:** ${coin.priceChange7d >= 0 ? '+' : ''}${coin.priceChange7d.toFixed(2)}%
- **30d Change:** ${coin.priceChange30d >= 0 ? '+' : ''}${coin.priceChange30d.toFixed(2)}%
- **24h High:** $${coin.high24h?.toLocaleString() || 'N/A'}
- **24h Low:** $${coin.low24h?.toLocaleString() || 'N/A'}

### Market Metrics
- **Market Cap Rank:** #${coin.marketCapRank || 'N/A'}
- **Market Cap:** $${(coin.marketCap / 1e9).toFixed(2)}B
- **24h Volume:** $${(coin.volume24h / 1e6).toFixed(2)}M
- **Volume/MCap Ratio:** ${((coin.volume24h / coin.marketCap) * 100).toFixed(2)}%
- **ATH:** $${coin.ath?.toLocaleString() || 'N/A'} (${coin.athChangePercentage?.toFixed(2) || 'N/A'}% from ATH)

### Technical Indicators
- **RSI (14):** ${indicators.rsi.toFixed(2)} ${indicators.rsi < 30 ? '⚠️ Oversold' : indicators.rsi > 70 ? '⚠️ Overbought' : '✅ Neutral'}
- **StochRSI:** K: ${indicators.stochRsi.k.toFixed(2)} / D: ${indicators.stochRsi.d.toFixed(2)}
- **Bollinger Bands:** Upper: $${indicators.bollingerBands.upper.toFixed(2)} | Middle: $${indicators.bollingerBands.middle.toFixed(2)} | Lower: $${indicators.bollingerBands.lower.toFixed(2)}
- **Pivot Points:** Pivot: $${indicators.pivotPoints.pivot.toFixed(2)} | R1: $${indicators.pivotPoints.r1.toFixed(2)} | S1: $${indicators.pivotPoints.s1.toFixed(2)}
- **SMA (20):** $${indicators.sma20.toFixed(2)} ${coin.currentPrice > indicators.sma20 ? '📈 Above' : '📉 Below'}
- **SMA (50):** $${indicators.sma50.toFixed(2)} ${coin.currentPrice > indicators.sma50 ? '📈 Above' : '📉 Below'}
- **MACD:** ${indicators.macd.macd.toFixed(4)} (Signal: ${indicators.macd.signal.toFixed(4)})
- **Volatility:** ${(indicators.volatility / coin.currentPrice * 100).toFixed(2)}%
- **Overall Trend:** ${indicators.trend === 'bullish' ? '🟢 Bullish' : indicators.trend === 'bearish' ? '🔴 Bearish' : '🟡 Neutral'}

### AI Trading Signal
- **Signal:** ${signals.signal.toUpperCase()} ${signals.signal === 'buy' ? '🟢' : signals.signal === 'sell' ? '🔴' : '🟡'}
- **Confidence:** ${signals.confidence}%
- **Key Reasons:**
${signals.reasons.map((r: string) => `  - ${r}`).join('\n')}

Use this data to provide accurate and contextual analysis.`;
  }

  return enhancedPrompt;
}

export async function POST(req: Request) {
  try {
    // Check AI configuration
    const aiConfig = checkAIConfig();
    console.log(aiConfig.message);

    if (!aiConfig.isConfigured) {
      const errorMessage = `# ⚠️ AI Service Not Configured\n\n${aiConfig.message}\n\n${getSetupInstructions()}`;
      return new Response(errorMessage, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const session = await getServerSession(authOptions);
    const { messages, sessionId, coinId, useAgent = false, userPortfolio } = await req.json();

    // Check if the last message is a non-trading query
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (lastUserMessage && isNonTradingQuery(lastUserMessage.content)) {
      // Return a polite redirect message
      const redirectMessage = "I'm specifically designed to help with **cryptocurrency trading and analysis**. 🪙\n\nPlease ask me about:\n- 📊 Price analysis and technical indicators\n- 📈 Trading strategies and entry/exit points\n- ⚠️ Risk assessment and management\n- 💡 Market trends and predictions\n- 📚 Educational content about crypto trading\n\nHow can I help you with your crypto trading journey?";

      return new Response(redirectMessage, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Use LangGraph agent for advanced queries (backtest, portfolio, predictions)
    if (useAgent || lastUserMessage.content.toLowerCase().includes('backtest') ||
      lastUserMessage.content.toLowerCase().includes('portfolio') ||
      lastUserMessage.content.toLowerCase().includes('predict')) {
      try {
        const marketContext = coinId ? await getMarketContext(coinId) : null;
        const response = await executeTradingAgent(
          lastUserMessage.content,
          coinId,
          marketContext?.coin?.symbol,
          userPortfolio
        );

        return new Response(response, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } catch (agentError) {
        console.error('Agent execution failed, falling back to standard mode:', agentError);
        // Fall through to standard mode
      }
    }

    // Attempt to detect coin if not provided
    let activeCoinId = coinId;
    let detectedCoinSymbol = null;

    if (!activeCoinId) {
      const content = lastUserMessage.content.toLowerCase();
      // Heuristics to extract potential coin name
      // Look for explicit patterns first
      const patterns = [
        /analyze\s+([a-z0-9\s]+)/,
        /price\s+of\s+([a-z0-9\s]+)/,
        /how\s+is\s+([a-z0-9\s]+)/,
        /about\s+([a-z0-9\s]+)/,
        /^([a-z0-9]+)\s+price/,
        /^([a-z0-9]+)\s+prediction/,
        /^([a-z0-9]+)$/ // Just the coin name
      ];

      let potentialQuery = null;
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          potentialQuery = match[1].trim();
          break;
        }
      }

      // If no pattern match, try cleaning common words
      if (!potentialQuery && content.length < 50) { // Only for short messages
        const cleanContent = content
          .replace(/[^\w\s]/g, '') // Remove punctuation
          .replace(/\b(analyze|analysis|price|chart|trend|prediction|forecast|about|tell|me|how|is|doing|what|the|of|crypto|coin|token|market|value|worth|buy|sell|trade|should|i)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanContent.length > 1 && cleanContent.length < 20) {
          potentialQuery = cleanContent;
        }
      }

      if (potentialQuery) {
        try {
          const { searchCoins } = await import('@/services/coingecko');
          const searchResults = await searchCoins(potentialQuery);
          if (searchResults && searchResults.coins && searchResults.coins.length > 0) {
            // Find an exact symbol match if possible, otherwise take the first result
            const exactMatch = searchResults.coins.find((c: any) =>
              c.symbol.toLowerCase() === potentialQuery?.toLowerCase() ||
              c.name.toLowerCase() === potentialQuery?.toLowerCase()
            );

            const bestMatch = exactMatch || searchResults.coins[0];
            activeCoinId = bestMatch.id;
            detectedCoinSymbol = bestMatch.symbol;
            console.log(`Auto-detected coin: ${bestMatch.name} (${activeCoinId}) from query "${potentialQuery}"`);
          }
        } catch (err) {
          console.error('Coin auto-detection failed:', err);
        }
      }
    }

    // Get market context if analyzing a specific coin
    const marketContext = activeCoinId ? await getMarketContext(activeCoinId) : null;

    // Build enhanced system prompt with market data
    const enhancedPrompt = buildEnhancedPrompt(marketContext);

    const result = streamText({
      model: getAIModel(),
      system: enhancedPrompt,
      messages: messages,
      temperature: AI_CONFIG.temperature,
      onFinish: async ({ text }) => {
        // Save chat history after streaming completes (if user is authenticated)
        if (session?.user && sessionId && text) {
          try {
            // Save both user message and AI response
            const allMessages = [
              ...messages,
              { role: 'assistant', content: text }
            ];

            await saveChatHistory(session.user.id, sessionId, allMessages, coinId, marketContext);
          } catch (err) {
            console.error('Failed to save chat history:', err);
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Trading assistant error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: `Failed to process request: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Async function to save chat history
async function saveChatHistory(
  userId: string,
  sessionId: string,
  messages: any[],
  coinId?: string,
  marketContext?: any
) {
  try {
    const dbConnect = (await import('@/lib/db')).default;
    const ChatHistory = (await import('@/models/ChatHistory')).default;

    await dbConnect();

    // Generate title from first user message if this is a new session
    const firstUserMessage = messages.find((m: any) => m.role === 'user');
    const title = firstUserMessage
      ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
      : 'New Chat';

    // Replace all messages instead of pushing to avoid duplicates
    // Preserve message IDs if they exist
    await ChatHistory.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          userId,
          title,
          coinId: coinId || undefined,
          messages: messages.map((msg: any) => ({
            id: msg.id, // Preserve the original message ID
            role: msg.role,
            content: msg.content,
            timestamp: new Date(),
            metadata: coinId ? {
              coinId,
              coinSymbol: marketContext?.coin.symbol,
              priceAtTime: marketContext?.coin.currentPrice,
            } : undefined,
          })),
        },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw error;
  }
}
