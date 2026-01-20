interface PriceData {
  timestamp: number;
  price: number;
}

interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export class TradingAnalyzer {
  // Calculate Simple Moving Average
  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / period;
  }

  // Calculate Relative Strength Index
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Calculate MACD
  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // For signal line, we'd need to calculate EMA of MACD values
    // Simplified version here
    const signal = macd * 0.9; // Approximation
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  // Calculate Exponential Moving Average
  static calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  // Calculate Volatility (standard deviation)
  static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
    
    return Math.sqrt(variance);
  }

  // Determine trend
  static determineTrend(prices: number[]): 'bullish' | 'bearish' | 'neutral' {
    if (prices.length < 20) return 'neutral';

    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const currentPrice = prices[prices.length - 1];

    if (currentPrice > sma20 && sma20 > sma50) return 'bullish';
    if (currentPrice < sma20 && sma20 < sma50) return 'bearish';
    return 'neutral';
  }

  // Get comprehensive technical analysis
  static analyzePriceData(prices: number[]): TechnicalIndicators {
    return {
      sma20: this.calculateSMA(prices, 20),
      sma50: this.calculateSMA(prices, 50),
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      volatility: this.calculateVolatility(prices),
      trend: this.determineTrend(prices),
    };
  }

  // Generate trading signals
  static generateSignals(indicators: TechnicalIndicators, currentPrice: number): {
    signal: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let bullishSignals = 0;
    let bearishSignals = 0;

    // RSI Analysis
    if (indicators.rsi < 30) {
      bullishSignals++;
      reasons.push('RSI indicates oversold conditions (potential buy opportunity)');
    } else if (indicators.rsi > 70) {
      bearishSignals++;
      reasons.push('RSI indicates overbought conditions (potential sell signal)');
    }

    // Trend Analysis
    if (indicators.trend === 'bullish') {
      bullishSignals++;
      reasons.push('Price is in an uptrend (bullish momentum)');
    } else if (indicators.trend === 'bearish') {
      bearishSignals++;
      reasons.push('Price is in a downtrend (bearish momentum)');
    }

    // MACD Analysis
    if (indicators.macd.histogram > 0) {
      bullishSignals++;
      reasons.push('MACD histogram is positive (bullish momentum)');
    } else {
      bearishSignals++;
      reasons.push('MACD histogram is negative (bearish momentum)');
    }

    // Moving Average Analysis
    if (currentPrice > indicators.sma20 && currentPrice > indicators.sma50) {
      bullishSignals++;
      reasons.push('Price above both 20 and 50 SMA (strong bullish signal)');
    } else if (currentPrice < indicators.sma20 && currentPrice < indicators.sma50) {
      bearishSignals++;
      reasons.push('Price below both 20 and 50 SMA (strong bearish signal)');
    }

    const totalSignals = bullishSignals + bearishSignals;
    const confidence = totalSignals > 0 ? Math.abs(bullishSignals - bearishSignals) / totalSignals : 0;

    let signal: 'buy' | 'sell' | 'hold' = 'hold';
    if (bullishSignals > bearishSignals && confidence > 0.3) {
      signal = 'buy';
    } else if (bearishSignals > bullishSignals && confidence > 0.3) {
      signal = 'sell';
    }

    return {
      signal,
      confidence: Math.round(confidence * 100),
      reasons,
    };
  }
}
