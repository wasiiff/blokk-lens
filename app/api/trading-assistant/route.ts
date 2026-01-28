import { streamText } from 'ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoinDetails, getCoinMarketChart } from '@/services/coingecko';
import { TradingAnalyzer } from '@/services/trading-analysis';
import { getAIModel, AI_CONFIG } from '@/lib/ai-config';

// Use Node.js runtime for MongoDB support
export const runtime = 'nodejs';
export const maxDuration = 30;

// Enhanced trading-focused system prompt
const TRADING_SYSTEM_PROMPT = `You are an expert cryptocurrency trading assistant with deep knowledge of technical analysis, market trends, and blockchain technology. You are STRICTLY a trading and cryptocurrency assistant.

IMPORTANT RULES:
1. ONLY respond to questions related to cryptocurrency trading, technical analysis, market analysis, blockchain, DeFi, and related financial topics.
2. If a user asks about anything unrelated to crypto/trading (like cooking, coding unrelated to crypto, general chat, etc.), politely redirect them by saying: "I'm specifically designed to help with cryptocurrency trading and analysis. Please ask me about crypto prices, technical indicators, trading strategies, or market analysis!"
3. Never provide specific financial advice or guarantee profits. Always include appropriate risk disclaimers.
4. Be data-driven and reference the technical indicators when available.
5. Format responses using markdown for better readability:
   - Use **bold** for important terms
   - Use bullet points for lists
   - Use headers (##) for sections when appropriate
   - Use \`code\` formatting for specific values

Your capabilities include:
- 📊 Technical Analysis (RSI, MACD, Moving Averages, Bollinger Bands, etc.)
- 📈 Price trend analysis and pattern recognition
- 🎯 Support and resistance level identification
- ⚠️ Risk assessment and management strategies
- 💡 Trading strategy recommendations
- 📚 Educational content about trading concepts

When analyzing specific coins, always reference:
- Current price and 24h change
- Key technical indicators
- Volume analysis
- Market sentiment indicators
- Support/resistance levels

Always be helpful, educational, and remind users that trading involves risk.`;

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
- **SMA (20):** $${indicators.sma20.toFixed(2)} ${coin.currentPrice > indicators.sma20 ? '📈 Above' : '📉 Below'}
- **SMA (50):** $${indicators.sma50.toFixed(2)} ${coin.currentPrice > indicators.sma50 ? '📈 Above' : '📉 Below'}
- **MACD:** ${indicators.macd.macd.toFixed(4)}
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
    const session = await getServerSession(authOptions);
    const { messages, sessionId, coinId } = await req.json();

    // Check if the last message is a non-trading query
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (lastUserMessage && isNonTradingQuery(lastUserMessage.content)) {
      // Return a polite redirect message
      const redirectMessage = "I'm specifically designed to help with **cryptocurrency trading and analysis**. 🪙\n\nPlease ask me about:\n- 📊 Price analysis and technical indicators\n- 📈 Trading strategies and entry/exit points\n- ⚠️ Risk assessment and management\n- 💡 Market trends and predictions\n- 📚 Educational content about crypto trading\n\nHow can I help you with your crypto trading journey?";
      
      return new Response(redirectMessage, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Get market context if analyzing a specific coin
    const marketContext = coinId ? await getMarketContext(coinId) : null;

    // Build enhanced system prompt with market data
    const enhancedPrompt = buildEnhancedPrompt(marketContext);

    const result = streamText({
      model: getAIModel(),
      system: enhancedPrompt,
      messages: messages,
      temperature: AI_CONFIG.temperature,
    });

    // Get the full response text
    const stream = result.toTextStreamResponse();
    
    // Save chat history after streaming completes (if user is authenticated)
    if (session?.user && sessionId) {
      // Clone the stream so we can read it
      const [stream1, stream2] = stream.body ? stream.body.tee() : [null, null];
      
      if (stream1 && stream2) {
        // Read the full response in the background
        (async () => {
          try {
            const reader = stream2.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              fullResponse += decoder.decode(value, { stream: true });
            }
            
            // Save both user message and AI response
            const allMessages = [
              ...messages,
              { role: 'assistant', content: fullResponse }
            ];
            
            await saveChatHistory(session.user.id, sessionId, allMessages, coinId, marketContext);
          } catch (err) {
            console.error('Failed to save chat history:', err);
          }
        })();
        
        return new Response(stream1, {
          headers: stream.headers,
        });
      }
    }

    return stream;
  } catch (error) {
    console.error('Trading assistant error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
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
