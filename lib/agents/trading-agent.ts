/**
 * LangGraph-based Trading Agent
 * 
 * This agent orchestrates multiple specialized sub-agents for:
 * - Technical analysis
 * - Price predictions
 * - Portfolio recommendations
 * - Risk assessment
 * - Backtesting
 */

import { TradingAnalyzer } from "@/services/trading-analysis";
import { getAIModel } from "@/lib/ai-config";
import { generateText } from "ai";

// Agent State Interface
interface TradingAgentState {
  messages: Array<{ role: string; content: string }>;
  correctedPrompt?: string;
  coinId?: string;
  coinSymbol?: string;
  userPortfolio?: any[];
  technicalAnalysis?: any;
  priceData?: number[];
  prediction?: any;
  signals?: any;
  backtestResults?: any;
  communityData?: any;
  nextAction?: string;
  finalResponse?: string;
}

/**
 * Router Node - Determines which analysis to perform
 */
async function routerNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const content = lastMessage.content.toString().toLowerCase();

  // Determine what the user is asking for
  let nextAction = "general_analysis";

  if (content.includes("backtest") || content.includes("historical")) {
    nextAction = "backtest";
  } else if (content.includes("portfolio") || content.includes("diversif")) {
    nextAction = "portfolio_analysis";
  } else if (content.includes("predict") || content.includes("forecast")) {
    nextAction = "prediction";
  } else if (content.includes("technical") || content.includes("indicator")) {
    nextAction = "technical_analysis";
  } else if (content.includes("community") || content.includes("sentiment")) {
    nextAction = "community_analysis";
  }

  return { nextAction };
}

/**
 * Spelling Correction Node - Fixes typos in user prompt
 */
async function correctSpellingNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  try {
    const lastMessage = state.messages[state.messages.length - 1].content;
    const prompt = `Correct the spelling and grammar of the following cryptocurrency trading related user prompt. Only return the corrected text, nothing else. Do not add any conversational filler.
    
    Original: "${lastMessage}"`;

    const { text } = await generateText({
      model: getAIModel(),
      prompt,
    });

    return { correctedPrompt: text.trim() };
  } catch (error) {
    console.error("Spelling correction error:", error);
    return { correctedPrompt: state.messages[state.messages.length - 1].content };
  }
}

/**
 * Technical Analysis Node
 */
async function technicalAnalysisNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  try {
    // Fetch price data if not available
    let priceData = state.priceData;
    if (!priceData && state.coinId) {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${state.coinId}/market_chart?vs_currency=usd&days=90&interval=daily`,
        {
          headers: process.env.COINGECKO_API_KEY
            ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
            : {},
        }
      );
      const data = await response.json();
      priceData = data.prices?.map((p: [number, number]) => p[1]) || [];
    }

    if (!priceData || priceData.length === 0) {
      return { technicalAnalysis: null };
    }

    // Perform technical analysis
    const indicators = TradingAnalyzer.analyzePriceData(priceData);
    const currentPrice = priceData[priceData.length - 1];
    const signals = TradingAnalyzer.generateSignals(indicators, currentPrice);

    return {
      priceData,
      technicalAnalysis: indicators,
      signals,
    };
  } catch (error) {
    console.error("Technical analysis error:", error);
    return { technicalAnalysis: null };
  }
}

/**
 * Prediction Node - AI-powered price predictions
 */
async function predictionNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  try {
    const { technicalAnalysis, priceData, coinSymbol } = state;

    if (!technicalAnalysis || !priceData) {
      return { prediction: null };
    }

    const currentPrice = priceData[priceData.length - 1];
    const prompt = `Based on the following technical analysis for ${coinSymbol || "this cryptocurrency"}:

Current Price: $${currentPrice.toFixed(2)}
RSI: ${technicalAnalysis.rsi.toFixed(2)}
Trend: ${technicalAnalysis.trend}
SMA 20: $${technicalAnalysis.sma20.toFixed(2)}
SMA 50: $${technicalAnalysis.sma50.toFixed(2)}
MACD: ${technicalAnalysis.macd.macd.toFixed(2)}
Volatility: ${technicalAnalysis.volatility.toFixed(2)}

Provide a price prediction for the next 7 days and 30 days. Include:
1. Predicted price ranges (low, mid, high)
2. Confidence level (%)
3. Key factors influencing the prediction
4. Potential risks

Format as JSON with structure: { "7day": {...}, "30day": {...}, "confidence": number, "factors": [], "risks": [] }`;

    const { text } = await generateText({
      model: getAIModel(),
      prompt,
    });

    // Try to parse JSON from response
    let prediction;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      }
    } catch {
      prediction = { raw: text };
    }

    return { prediction };
  } catch (error) {
    console.error("Prediction error:", error);
    return { prediction: null };
  }
}

/**
 * Portfolio Analysis Node
 */
async function portfolioAnalysisNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  try {
    const { userPortfolio, technicalAnalysis, coinId } = state;

    const prompt = `Analyze this cryptocurrency portfolio and provide recommendations:

${userPortfolio ? `Current Portfolio: ${JSON.stringify(userPortfolio, null, 2)}` : "No portfolio data available"}

${coinId ? `User is interested in: ${coinId}` : ""}

${technicalAnalysis ? `Technical Analysis: ${JSON.stringify(technicalAnalysis, null, 2)}` : ""}

Provide:
1. Portfolio diversification score (0-100)
2. Risk assessment
3. Rebalancing recommendations
4. Position sizing suggestions
5. Entry/exit strategies

Be specific and actionable.`;

    const { text } = await generateText({
      model: getAIModel(),
      prompt,
    });

    return {
      finalResponse: text,
    };
  } catch (error) {
    console.error("Portfolio analysis error:", error);
    return {
      finalResponse: "I apologize, but I encountered an error analyzing your portfolio. Please try again.",
    };
  }
}

/**
 * Backtest Node - Test strategies against historical data
 */
async function backtestNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  try {
    const { priceData } = state;

    if (!priceData || priceData.length < 30) {
      return { backtestResults: null };
    }

    // Simple backtest simulation
    let capital = 10000; // Starting capital
    let position = 0; // Current position
    let trades = 0;
    let wins = 0;
    const tradeHistory: any[] = [];

    // Simulate trading based on signals
    for (let i = 20; i < priceData.length - 1; i++) {
      const prices = priceData.slice(0, i + 1);
      const indicators = TradingAnalyzer.analyzePriceData(prices);
      const currentPrice = prices[prices.length - 1];
      const signal = TradingAnalyzer.generateSignals(indicators, currentPrice);

      // Buy signal
      if (signal.signal === "buy" && position === 0 && signal.confidence > 50) {
        position = capital / currentPrice;
        capital = 0;
        trades++;
        tradeHistory.push({
          type: "buy",
          price: currentPrice,
          date: i,
          confidence: signal.confidence,
        });
      }
      // Sell signal
      else if (signal.signal === "sell" && position > 0 && signal.confidence > 50) {
        capital = position * currentPrice;
        const profit = capital - 10000;
        if (profit > 0) wins++;
        position = 0;
        trades++;
        tradeHistory.push({
          type: "sell",
          price: currentPrice,
          date: i,
          confidence: signal.confidence,
          profit,
        });
      }
    }

    // Close any open position
    if (position > 0) {
      capital = position * priceData[priceData.length - 1];
    }

    const finalReturn = ((capital - 10000) / 10000) * 100;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0;

    const backtestResults = {
      initialCapital: 10000,
      finalCapital: capital,
      totalReturn: finalReturn,
      totalTrades: trades,
      winningTrades: wins,
      winRate,
      tradeHistory: tradeHistory.slice(-10), // Last 10 trades
    };

    return { backtestResults };
  } catch (error) {
    console.error("Backtest error:", error);
    return { backtestResults: null };
  }
}

/**
 * Community Analysis Node - Analyze social sentiment
 */
async function communityAnalysisNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  try {
    const { coinId } = state;

    if (!coinId) {
      return { communityData: null };
    }

    // Fetch community data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=false`,
      {
        headers: process.env.COINGECKO_API_KEY
          ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
          : {},
      }
    );

    const data = await response.json();
    const communityData = {
      twitterFollowers: data.community_data?.twitter_followers || 0,
      redditSubscribers: data.community_data?.reddit_subscribers || 0,
      telegramUsers: data.community_data?.telegram_channel_user_count || 0,
      sentimentVotesUp: data.sentiment_votes_up_percentage || 0,
      sentimentVotesDown: data.sentiment_votes_down_percentage || 0,
    };

    return { communityData };
  } catch (error) {
    console.error("Community analysis error:", error);
    return { communityData: null };
  }
}

/**
 * Response Generator Node - Synthesize all analysis into final response
 */
async function responseGeneratorNode(state: TradingAgentState): Promise<Partial<TradingAgentState>> {
  try {
    if (state.finalResponse) {
      return {}; // Already have a response from portfolio analysis
    }

    const {
      messages,
      technicalAnalysis,
      signals,
      prediction,
      backtestResults,
      communityData,
    } = state;

    const lastUserMessage = messages[messages.length - 1].content.toString();

    const contextParts = [];

    if (technicalAnalysis) {
      contextParts.push(`Technical Analysis:
- RSI: ${technicalAnalysis.rsi.toFixed(2)} (${technicalAnalysis.rsi < 30 ? "Oversold" : technicalAnalysis.rsi > 70 ? "Overbought" : "Neutral"})
- Trend: ${technicalAnalysis.trend}
- SMA 20: $${technicalAnalysis.sma20.toFixed(2)}
- SMA 50: $${technicalAnalysis.sma50.toFixed(2)}
- Volatility: ${technicalAnalysis.volatility.toFixed(2)}`);
    }

    if (signals) {
      contextParts.push(`Trading Signals:
- Signal: ${signals.signal.toUpperCase()}
- Confidence: ${signals.confidence}%
- Reasons: ${signals.reasons.join(", ")}`);
    }

    if (prediction) {
      contextParts.push(`Price Prediction: ${JSON.stringify(prediction, null, 2)}`);
    }

    if (backtestResults) {
      contextParts.push(`Backtest Results:
- Total Return: ${backtestResults.totalReturn.toFixed(2)}%
- Win Rate: ${backtestResults.winRate.toFixed(2)}%
- Total Trades: ${backtestResults.totalTrades}`);
    }

    if (communityData) {
      contextParts.push(`Community Sentiment:
- Twitter Followers: ${communityData.twitterFollowers.toLocaleString()}
- Reddit Subscribers: ${communityData.redditSubscribers.toLocaleString()}
- Positive Sentiment: ${communityData.sentimentVotesUp}%`);
    }

    const systemPrompt = `You are an expert cryptocurrency trading assistant. Use the following analysis to answer the user's question comprehensively and professionally.

${contextParts.join("\n\n")}

Provide actionable insights while emphasizing risk management. Be conversational and educational.`;

    const { text } = await generateText({
      model: getAIModel(),
      system: systemPrompt,
      prompt: state.correctedPrompt || lastUserMessage,
    });

    // Generate Easy Suggestion (TL;DR)
    const easySuggestionPrompt = `Based on this analysis:
    ${text}
    
    Provide a super simple, easy-to-understand 1-2 line suggestion for the user. 
    If it's a buy signal, say something like "Looks good for a buy around $X". 
    If it's risky, say "Better to wait, market is choppy". 
    Keep it dead simple. No jargon.`;

    const { text: easySuggestion } = await generateText({
      model: getAIModel(),
      prompt: easySuggestionPrompt,
    });

    return {
      finalResponse: text + `\n\n---\n\n**💡 Simple Suggestion:**\n${easySuggestion.trim()}`,
    };
  } catch (error) {
    console.error("Response generation error:", error);
    return {
      finalResponse: "I apologize, but I encountered an error generating the analysis. Please try again.",
    };
  }
}

/**
 * Create the Trading Agent Graph
 * Note: Using simplified approach without LangGraph for now
 * Can be enhanced with proper LangGraph implementation later
 */
export async function createTradingAgent() {
  // Simplified agent that routes to appropriate analysis
  return {
    invoke: async (state: TradingAgentState) => {
      // Correct spelling first
      const corrected = await correctSpellingNode(state);
      state.correctedPrompt = corrected.correctedPrompt;

      // Determine action using corrected prompt if available
      const action = await routerNode(state);
      state.nextAction = action.nextAction;

      // Execute appropriate analysis
      if (state.nextAction === "portfolio_analysis") {
        const result = await portfolioAnalysisNode(state);
        return { ...state, ...result };
      } else if (state.nextAction === "backtest") {
        const techResult = await technicalAnalysisNode(state);
        Object.assign(state, techResult);
        const backtestResult = await backtestNode(state);
        Object.assign(state, backtestResult);
        const finalResult = await responseGeneratorNode(state);
        return { ...state, ...finalResult };
      } else if (state.nextAction === "prediction") {
        const techResult = await technicalAnalysisNode(state);
        Object.assign(state, techResult);
        const predResult = await predictionNode(state);
        Object.assign(state, predResult);
        const finalResult = await responseGeneratorNode(state);
        return { ...state, ...finalResult };
      } else if (state.nextAction === "community_analysis") {
        const commResult = await communityAnalysisNode(state);
        Object.assign(state, commResult);
        const finalResult = await responseGeneratorNode(state);
        return { ...state, ...finalResult };
      } else {
        // Default: technical analysis
        const techResult = await technicalAnalysisNode(state);
        Object.assign(state, techResult);
        const finalResult = await responseGeneratorNode(state);
        return { ...state, ...finalResult };
      }
    }
  };
}

/**
 * Execute the trading agent
 */
export async function executeTradingAgent(
  userMessage: string,
  coinId?: string,
  coinSymbol?: string,
  userPortfolio?: any[]
): Promise<string> {
  const agent = await createTradingAgent();

  const initialState: TradingAgentState = {
    messages: [{ role: 'user', content: userMessage }],
    coinId,
    coinSymbol,
    userPortfolio,
  };

  try {
    const result = await agent.invoke(initialState);
    return result.finalResponse || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Agent execution error:", error);
    return "I encountered an error processing your request. Please try again.";
  }
}
