import { streamText } from 'ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoinDetails, getCoinMarketChart } from '@/services/coingecko';
import { TradingAnalyzer } from '@/services/trading-analysis';
import { getAIModel, AI_CONFIG, SYSTEM_PROMPTS } from '@/lib/ai-config';

// Use Node.js runtime for MongoDB support
export const runtime = 'nodejs';
export const maxDuration = 30;

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

    return {
      coin: {
        id: details.id,
        symbol: details.symbol,
        name: details.name,
        currentPrice: details.market_data.current_price.usd,
        priceChange24h: details.market_data.price_change_percentage_24h,
        marketCap: details.market_data.market_cap.usd,
        volume24h: details.market_data.total_volume.usd,
      },
      technicalAnalysis: {
        indicators,
        signals,
        priceHistory: prices.slice(-50), // Last 50 data points
      },
    };
  } catch (error) {
    console.error('Error fetching market context:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { messages, sessionId, coinId } = await req.json();

    // Get market context if analyzing a specific coin
    const marketContext = coinId ? await getMarketContext(coinId) : null;

    // Build enhanced system prompt with market data
    let enhancedPrompt = SYSTEM_PROMPTS.TRADING_ASSISTANT;
    if (marketContext) {
      enhancedPrompt += `\n\nCurrent Market Data for ${marketContext.coin.name} (${marketContext.coin.symbol.toUpperCase()}):\n`;
      enhancedPrompt += `- Price: $${marketContext.coin.currentPrice.toLocaleString()}\n`;
      enhancedPrompt += `- 24h Change: ${marketContext.coin.priceChange24h.toFixed(2)}%\n`;
      enhancedPrompt += `- Market Cap: $${(marketContext.coin.marketCap / 1e9).toFixed(2)}B\n`;
      enhancedPrompt += `- Volume (24h): $${(marketContext.coin.volume24h / 1e6).toFixed(2)}M\n\n`;
      
      enhancedPrompt += `Technical Indicators:\n`;
      enhancedPrompt += `- RSI (14): ${marketContext.technicalAnalysis.indicators.rsi.toFixed(2)}\n`;
      enhancedPrompt += `- SMA (20): $${marketContext.technicalAnalysis.indicators.sma20.toFixed(2)}\n`;
      enhancedPrompt += `- SMA (50): $${marketContext.technicalAnalysis.indicators.sma50.toFixed(2)}\n`;
      enhancedPrompt += `- Trend: ${marketContext.technicalAnalysis.indicators.trend}\n`;
      enhancedPrompt += `- MACD: ${marketContext.technicalAnalysis.indicators.macd.macd.toFixed(4)}\n\n`;
      
      enhancedPrompt += `Trading Signal: ${marketContext.technicalAnalysis.signals.signal.toUpperCase()}\n`;
      enhancedPrompt += `Confidence: ${marketContext.technicalAnalysis.signals.confidence}%\n`;
      enhancedPrompt += `Reasons:\n${marketContext.technicalAnalysis.signals.reasons.map(r => `- ${r}`).join('\n')}`;
    }

    // Save chat history if user is authenticated (async, don't await)
    if (session?.user && sessionId) {
      saveChatHistory(session.user.id, sessionId, messages, coinId, marketContext).catch(err => {
        console.error('Failed to save chat history:', err);
      });
    }

    const result = streamText({
      model: getAIModel(),
      system: enhancedPrompt,
      messages: messages,
      temperature: AI_CONFIG.temperature,
    });

    return result.toTextStreamResponse();
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
    await ChatHistory.findOneAndUpdate(
      { sessionId },
      {
        $set: { userId },
        $push: {
          messages: {
            $each: messages.slice(-1).map((msg: any) => ({
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
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw error;
  }
}
