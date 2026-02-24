"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TradingAnalyzer } from '@/services/trading-analysis';

interface PriceChartProps {
  coinId: string;
  days?: number;
}

interface ChartData {
  timestamp: number;
  price: number;
  sma20?: number;
  sma50?: number;
}

const TIME_PERIODS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'MAX', days: 'max' as any },
];

export default function PriceChart({ coinId, days: initialDays = 30 }: PriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialDays);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [indicators, setIndicators] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Use our backend API to avoid CORS and API key issues
        const response = await fetch(
          `/api/coins/chart?coinId=${coinId}&days=${selectedPeriod}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const data = await response.json();

        if (!data.prices || data.prices.length === 0) {
          throw new Error('No chart data available');
        }

        const prices = data.prices.map((p: [number, number]) => p[1]);
        const analysis = TradingAnalyzer.analyzePriceData(prices);
        
        // Prepare chart data with moving averages
        const formattedData: ChartData[] = data.prices.map((point: [number, number], index: number) => {
          const dataPoint: ChartData = {
            timestamp: point[0],
            price: point[1],
          };

          // Calculate SMAs for each point
          if (index >= 19) {
            const slice20 = prices.slice(index - 19, index + 1);
            dataPoint.sma20 = TradingAnalyzer.calculateSMA(slice20, 20);
          }
          if (index >= 49) {
            const slice50 = prices.slice(index - 49, index + 1);
            dataPoint.sma50 = TradingAnalyzer.calculateSMA(slice50, 50);
          }

          return dataPoint;
        });

        // Decimate data for MAX period to keep chart performant (max ~500 points)
        const MAX_POINTS = 500;
        const decimated = formattedData.length > MAX_POINTS
          ? formattedData.filter((_, i) => i % Math.ceil(formattedData.length / MAX_POINTS) === 0)
          : formattedData;

        setChartData(decimated);
        setIndicators(analysis);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coinId, selectedPeriod]);

  if (loading) {
    return (
      <Card className="glass-card-light border border-border p-4 sm:p-6">
        <div className="h-[350px] sm:h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card-light border border-border p-4 sm:p-6">
        <div className="h-[350px] sm:h-[400px] flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 text-sm">{error}</div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setError(null);
              setLoading(true);
              // Trigger re-fetch
              setSelectedPeriod(prev => prev);
            }}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const currentPrice = chartData[chartData.length - 1]?.price || 0;

  return (
    <Card className="glass-card-light border border-border p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold card-text">Price Chart</h3>
          
          {/* Time Period Selector */}
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            {TIME_PERIODS.map((period) => (
              <Button
                key={period.label}
                variant={selectedPeriod === period.days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.days)}
                className={`h-8 px-3 text-xs sm:text-sm transition-all ${
                  selectedPeriod === period.days
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {indicators && (
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">SMA 20</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">SMA 50</span>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                if (selectedPeriod <= 7) {
                  return format(date, 'MMM dd HH:mm');
                } else if (selectedPeriod <= 30) {
                  return format(date, 'MMM dd');
                } else if (selectedPeriod <= 365) {
                  return format(date, 'MMM yyyy');
                } else {
                  return format(date, 'yyyy');
                }
              }}
              className="text-xs"
              stroke="currentColor"
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              className="text-xs"
              stroke="currentColor"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                
                const formatPrice = (value: number) => {
                  if (value === 0) return '$0.00';
                  if (value >= 1) {
                    return `$${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;
                  }
                  // For values < 1, show significant digits
                  if (value >= 0.01) {
                    return `$${value.toFixed(4)}`;
                  }
                  if (value >= 0.0001) {
                    return `$${value.toFixed(6)}`;
                  }
                  // For very small values, use scientific notation or show up to 8 decimals
                  return `$${value.toFixed(8)}`;
                };
                
                return (
                  <div className="bg-popover border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">
                      {format(new Date(payload[0].payload.timestamp), 'MMM dd, yyyy')}
                    </p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {formatPrice(Number(entry.value))}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#f97316"
              strokeWidth={1.5}
              dot={false}
              name="SMA 20"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
              name="SMA 50"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        {indicators && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">RSI (14)</p>
              <p className="text-base sm:text-lg font-semibold card-text">{indicators.rsi.toFixed(2)}</p>
              <p className={`text-xs ${indicators.rsi < 30 ? 'text-green-500' : indicators.rsi > 70 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {indicators.rsi < 30 ? 'Oversold' : indicators.rsi > 70 ? 'Overbought' : 'Neutral'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Trend</p>
              <p className="text-base sm:text-lg font-semibold card-text capitalize">{indicators.trend}</p>
              <p className={`text-xs ${indicators.trend === 'bullish' ? 'text-green-500' : indicators.trend === 'bearish' ? 'text-red-500' : 'text-muted-foreground'}`}>
                {indicators.trend === 'bullish' ? '↑ Uptrend' : indicators.trend === 'bearish' ? '↓ Downtrend' : '→ Sideways'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volatility</p>
              <p className="text-base sm:text-lg font-semibold card-text">${indicators.volatility.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Std. Deviation</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">MACD</p>
              <p className="text-base sm:text-lg font-semibold card-text">{indicators.macd.macd.toFixed(4)}</p>
              <p className={`text-xs ${indicators.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
