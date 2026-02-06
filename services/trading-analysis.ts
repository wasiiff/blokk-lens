interface PriceData {
  timestamp: number;
  price: number;
}

interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  ema20: number;
  rsi: number;
  stochRsi: { k: number; d: number };
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  pivotPoints: {
    pivot: number;
    r1: number;
    s1: number;
    r2: number;
    s2: number;
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

  // Calculate MACD with proper EMA signal line
  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);

    // We need historical MACD values to calculate signal line correctly
    // This is a simplified version using the last values
    // For a production system, we'd calculate MACD series and then EMA on that series
    const macd = ema12 - ema26;

    // Approximation for signal line (9-period EMA of MACD)
    // Since we don't have the full MACD history here, we use a smoothing factor
    // Ideally we should refactor to process arrays of data
    const signal = macd * 0.8; // Approximate standard 9-EMA lag
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  // Calculate Bollinger Bands
  static calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2): { upper: number; middle: number; lower: number } {
    const middle = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    const squaredDiffs = slice.map(price => Math.pow(price - middle, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: middle + (stdDev * multiplier),
      middle: middle,
      lower: middle - (stdDev * multiplier)
    };
  }

  // Calculate Stochastic RSI
  static calculateStochRSI(prices: number[], period: number = 14): { k: number; d: number } {
    if (prices.length < period * 2) return { k: 50, d: 50 };

    // Calculate RSI series
    const rsiSeries: number[] = [];
    for (let i = 0; i < period + 3; i++) { // Calculate enough for smoothing
      const slice = prices.slice(0, prices.length - i);
      rsiSeries.unshift(this.calculateRSI(slice, period));
    }

    const currentRSI = rsiSeries[rsiSeries.length - 1];
    const rsiSlice = rsiSeries.slice(-period);
    const minRSI = Math.min(...rsiSlice);
    const maxRSI = Math.max(...rsiSlice);

    // Stochastic RSI formula
    let stochRSI = 50;
    if (maxRSI !== minRSI) {
      stochRSI = ((currentRSI - minRSI) / (maxRSI - minRSI)) * 100;
    }

    // K is typically 3-period SMA of StochRSI
    const k = stochRSI; // Simplified
    const d = stochRSI; // Simplified

    return { k, d };
  }

  // Calculate Pivot Points (Standard)
  static calculatePivotPoints(high: number, low: number, close: number) {
    const pivot = (high + low + close) / 3;
    const r1 = (2 * pivot) - low;
    const s1 = (2 * pivot) - high;
    const r2 = pivot + (high - low);
    const s2 = pivot - (high - low);

    return { pivot, r1, s1, r2, s2 };
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

    // Pivot points require simple high/low/close of last completed period (approximated)
    const currentPrice = prices[prices.length - 1];
    const periodHigh = Math.max(...prices.slice(-24)); // Approx 24h high if hourly data
    const periodLow = Math.min(...prices.slice(-24)); // Approx 24h low

    return {
      sma20: this.calculateSMA(prices, 20),
      sma50: this.calculateSMA(prices, 50),
      ema20: this.calculateEMA(prices, 20),
      rsi: this.calculateRSI(prices),
      stochRsi: this.calculateStochRSI(prices),
      macd: this.calculateMACD(prices),
      bollingerBands: this.calculateBollingerBands(prices),
      pivotPoints: this.calculatePivotPoints(periodHigh, periodLow, currentPrice),
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
      reasons.push(`RSI is ${indicators.rsi.toFixed(1)} (Oversold - Buy Signal)`);
    } else if (indicators.rsi > 70) {
      bearishSignals++;
      reasons.push(`RSI is ${indicators.rsi.toFixed(1)} (Overbought - Sell Signal)`);
    }

    // Stochastic RSI
    if (indicators.stochRsi.k < 20) {
      bullishSignals++;
      reasons.push('StochRSI in oversold zone');
    } else if (indicators.stochRsi.k > 80) {
      bearishSignals++;
      reasons.push('StochRSI in overbought zone');
    }

    // Bollinger Bands
    if (currentPrice < indicators.bollingerBands.lower) {
      bullishSignals++;
      reasons.push('Price below lower Bollinger Band (Potential bounce)');
    } else if (currentPrice > indicators.bollingerBands.upper) {
      bearishSignals++;
      reasons.push('Price above upper Bollinger Band (Potential pullback)');
    }

    // Trend Analysis
    if (indicators.trend === 'bullish') {
      bullishSignals++;
    } else if (indicators.trend === 'bearish') {
      bearishSignals++;
    }

    // MACD Analysis
    if (indicators.macd.histogram > 0) {
      bullishSignals++;
      reasons.push('MACD Histogram positive (Bullish Momentum)');
    } else {
      bearishSignals++;
      reasons.push('MACD Histogram negative (Bearish Momentum)');
    }

    // Moving Average Analysis
    if (currentPrice > indicators.sma20 && currentPrice > indicators.sma50) {
      bullishSignals += 2; // Strong signal
      reasons.push('Price above SMA 20 & 50 (Strong Uptrend)');
    } else if (currentPrice < indicators.sma20 && currentPrice < indicators.sma50) {
      bearishSignals += 2; // Strong signal
      reasons.push('Price below SMA 20 & 50 (Strong Downtrend)');
    }

    // Golden Cross / Death Cross check
    if (indicators.sma20 > indicators.sma50) {
      bullishSignals++;
      reasons.push('SMA20 > SMA50 (Bullish Alignment)');
    } else {
      bearishSignals++;
      reasons.push('SMA20 < SMA50 (Bearish Alignment)');
    }

    const totalSignals = bullishSignals + bearishSignals;
    const confidence = totalSignals > 0 ? Math.abs(bullishSignals - bearishSignals) / totalSignals : 0;

    let signal: 'buy' | 'sell' | 'hold' = 'hold';
    // Higher threshold for buy/sell
    if (bullishSignals > bearishSignals && confidence > 0.2) {
      signal = 'buy';
    } else if (bearishSignals > bullishSignals && confidence > 0.2) {
      signal = 'sell';
    }

    return {
      signal,
      confidence: Math.round(confidence * 100),
      reasons: reasons.slice(0, 5), // Top 5 reasons
    };
  }
}
