"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BarChart3, Play, Trash2, TrendingUp, TrendingDown, Loader2, Calendar, DollarSign } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BacktestResult {
  _id: string;
  coinId: string;
  coinSymbol: string;
  strategyName: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  createdAt: string;
}

interface BacktestRunnerProps {
  coinId?: string;
  coinSymbol?: string;
}

export default function BacktestRunner({ coinId, coinSymbol }: BacktestRunnerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState('90');
  const [initialCapital, setInitialCapital] = useState('10000');
  const [minConfidence, setMinConfidence] = useState('60');

  const { data: results, isLoading } = useQuery({
    queryKey: ['backtest', coinId],
    queryFn: async () => {
      const url = coinId ? `/api/backtest?coinId=${coinId}&limit=5` : '/api/backtest?limit=10';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json() as Promise<BacktestResult[]>;
    },
    enabled: !!session,
  });

  const runMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to run backtest');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtest'] });
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (resultId: string) => {
      const res = await fetch(`/api/backtest?resultId=${resultId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete result');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtest'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!coinId || !coinSymbol) {
      alert('Missing coin information');
      return;
    }

    runMutation.mutate({
      coinId,
      coinSymbol,
      days: parseInt(days),
      initialCapital: parseFloat(initialCapital),
      strategyName: 'Technical Signals',
      strategyParams: {
        minConfidence: parseInt(minConfidence),
      },
    });
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Sign in to run backtests</p>
          <Button onClick={() => router.push('/auth/login')}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Strategy Backtesting
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                Run Backtest
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Strategy Backtest</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="days">Historical Period (Days)</Label>
                  <select
                    id="days"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
                  >
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="initialCapital">Initial Capital (USD)</Label>
                  <Input
                    id="initialCapital"
                    type="number"
                    step="100"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minConfidence">Minimum Signal Confidence (%)</Label>
                  <Input
                    id="minConfidence"
                    type="number"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher confidence = fewer but more reliable trades
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-2">Strategy: Technical Signals</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Uses RSI, MACD, and Moving Averages</li>
                    <li>• Buys on bullish signals</li>
                    <li>• Sells on bearish signals</li>
                    <li>• Confidence-based filtering</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={runMutation.isPending}>
                  {runMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Backtest...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Backtest
                    </>
                  )}
                </Button>

                {runMutation.isError && (
                  <p className="text-sm text-destructive">
                    {runMutation.error?.message || 'Failed to run backtest'}
                  </p>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result._id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{result.coinSymbol.toUpperCase()}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {result.strategyName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(result._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Return</p>
                    <p className={`text-lg font-bold flex items-center gap-1 ${
                      result.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {result.totalReturn >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Final Capital</p>
                    <p className="text-lg font-bold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {result.finalCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-sm font-semibold">
                      {result.winRate.toFixed(1)}% ({result.winningTrades}/{result.totalTrades})
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Max Drawdown</p>
                    <p className="text-sm font-semibold text-red-500">
                      -{result.maxDrawdown.toFixed(2)}%
                    </p>
                  </div>

                  {result.sharpeRatio !== undefined && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
                      <p className="text-sm font-semibold">
                        {result.sharpeRatio.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No backtest results yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Run a backtest to see how strategies perform
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
