import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import BacktestResult from '@/models/BacktestResult';
import User from '@/models/User';
import { TradingAnalyzer } from '@/services/trading-analysis';

// GET - Fetch user's backtest results
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get('coinId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = { userId: user._id };
    if (coinId) query.coinId = coinId;

    const results = await BacktestResult.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching backtest results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

// POST - Run a new backtest
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      coinId,
      coinSymbol,
      days = 90,
      initialCapital = 10000,
      strategyName = 'Technical Signals',
      strategyParams = {},
    } = body;

    if (!coinId || !coinSymbol) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch historical price data
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        headers: process.env.COINGECKO_API_KEY
          ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
          : {},
      }
    );

    const data = await response.json();
    const priceData = data.prices?.map((p: [number, number]) => ({
      timestamp: p[0],
      price: p[1],
    })) || [];

    if (priceData.length < 30) {
      return NextResponse.json(
        { error: 'Insufficient price data for backtesting' },
        { status: 400 }
      );
    }

    // Run backtest simulation
    let capital = initialCapital;
    let position = 0;
    let trades = 0;
    let wins = 0;
    let losses = 0;
    const tradeHistory: any[] = [];
    let maxCapital = initialCapital;
    let maxDrawdown = 0;

    const prices = priceData.map((p: any) => p.price);

    // Simulate trading
    for (let i = 20; i < prices.length - 1; i++) {
      const historicalPrices = prices.slice(0, i + 1);
      const indicators = TradingAnalyzer.analyzePriceData(historicalPrices);
      const currentPrice = prices[i];
      const signal = TradingAnalyzer.generateSignals(indicators, currentPrice);

      // Apply strategy parameters
      const minConfidence = strategyParams.minConfidence || 50;

      // Buy signal
      if (signal.signal === 'buy' && position === 0 && signal.confidence >= minConfidence) {
        position = capital / currentPrice;
        capital = 0;
        trades++;
        tradeHistory.push({
          type: 'buy',
          price: currentPrice,
          date: new Date(priceData[i].timestamp),
          confidence: signal.confidence,
        });
      }
      // Sell signal
      else if (signal.signal === 'sell' && position > 0 && signal.confidence >= minConfidence) {
        capital = position * currentPrice;
        const profit = capital - initialCapital;
        
        if (profit > 0) {
          wins++;
        } else {
          losses++;
        }

        position = 0;
        trades++;
        tradeHistory.push({
          type: 'sell',
          price: currentPrice,
          date: new Date(priceData[i].timestamp),
          confidence: signal.confidence,
          profit,
        });

        // Track max drawdown
        if (capital > maxCapital) {
          maxCapital = capital;
        }
        const drawdown = ((maxCapital - capital) / maxCapital) * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }

    // Close any open position at the end
    if (position > 0) {
      capital = position * prices[prices.length - 1];
      const profit = capital - initialCapital;
      if (profit > 0) wins++;
      else losses++;
    }

    const finalCapital = capital;
    const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0;

    // Calculate Sharpe Ratio (simplified)
    const returns = tradeHistory
      .filter((t) => t.type === 'sell' && t.profit !== undefined)
      .map((t) => (t.profit / initialCapital) * 100);

    let sharpeRatio = 0;
    if (returns.length > 0) {
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const stdDev = Math.sqrt(
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
      );
      sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    }

    // Save backtest result
    const result = await BacktestResult.create({
      userId: user._id,
      coinId,
      coinSymbol,
      strategyName,
      strategyParams,
      startDate: new Date(priceData[0].timestamp),
      endDate: new Date(priceData[priceData.length - 1].timestamp),
      initialCapital,
      finalCapital,
      totalReturn,
      totalTrades: trades,
      winningTrades: wins,
      losingTrades: losses,
      winRate,
      maxDrawdown,
      sharpeRatio,
      tradeHistory: tradeHistory.slice(-20), // Keep last 20 trades
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error running backtest:', error);
    return NextResponse.json({ error: 'Failed to run backtest' }, { status: 500 });
  }
}

// DELETE - Delete a backtest result
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const resultId = searchParams.get('resultId');

    if (!resultId) {
      return NextResponse.json({ error: 'Result ID required' }, { status: 400 });
    }

    const result = await BacktestResult.findOneAndDelete({
      _id: resultId,
      userId: user._id,
    });

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Backtest result deleted successfully' });
  } catch (error) {
    console.error('Error deleting backtest result:', error);
    return NextResponse.json({ error: 'Failed to delete result' }, { status: 500 });
  }
}
