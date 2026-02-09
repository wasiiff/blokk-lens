"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Percent, Activity, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Alert {
  _id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  alertType: 'price_above' | 'price_below' | 'percent_change' | 'technical_signal';
  targetPrice?: number;
  percentChange?: number;
  technicalSignal?: 'buy' | 'sell' | 'rsi_oversold' | 'rsi_overbought';
  currentPrice: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

interface AlertsManagerProps {
  coinId?: string;
  coinSymbol?: string;
  coinName?: string;
  currentPrice?: number;
}

export default function AlertsManager({ coinId, coinSymbol, coinName, currentPrice }: AlertsManagerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [alertType, setAlertType] = useState<Alert['alertType']>('price_above');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentChange, setPercentChange] = useState('');
  const [technicalSignal, setTechnicalSignal] = useState<Alert['technicalSignal']>('buy');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', coinId],
    queryFn: async () => {
      const url = coinId ? `/api/alerts?coinId=${coinId}` : '/api/alerts';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json() as Promise<Alert[]>;
    },
    enabled: !!session,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch(`/api/alerts?alertId=${alertId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, isActive }),
      });
      if (!res.ok) throw new Error('Failed to update alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const resetForm = () => {
    setAlertType('price_above');
    setTargetPrice('');
    setPercentChange('');
    setTechnicalSignal('buy');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!coinId || !coinSymbol || !coinName || !currentPrice) {
      alert('Missing coin information');
      return;
    }

    const data: any = {
      coinId,
      coinSymbol,
      coinName,
      alertType,
      currentPrice,
    };

    if (alertType === 'price_above' || alertType === 'price_below') {
      if (!targetPrice) {
        alert('Please enter a target price');
        return;
      }
      data.targetPrice = parseFloat(targetPrice);
    } else if (alertType === 'percent_change') {
      if (!percentChange) {
        alert('Please enter a percent change');
        return;
      }
      data.percentChange = parseFloat(percentChange);
    } else if (alertType === 'technical_signal') {
      data.technicalSignal = technicalSignal;
    }

    createMutation.mutate(data);
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Sign in to set price alerts</p>
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
            <Bell className="w-5 h-5" />
            Price Alerts
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Alert Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      type="button"
                      variant={alertType === 'price_above' ? 'default' : 'outline'}
                      onClick={() => setAlertType('price_above')}
                      className="gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Price Above
                    </Button>
                    <Button
                      type="button"
                      variant={alertType === 'price_below' ? 'default' : 'outline'}
                      onClick={() => setAlertType('price_below')}
                      className="gap-2"
                    >
                      <TrendingDown className="w-4 h-4" />
                      Price Below
                    </Button>
                    <Button
                      type="button"
                      variant={alertType === 'percent_change' ? 'default' : 'outline'}
                      onClick={() => setAlertType('percent_change')}
                      className="gap-2"
                    >
                      <Percent className="w-4 h-4" />
                      % Change
                    </Button>
                    <Button
                      type="button"
                      variant={alertType === 'technical_signal' ? 'default' : 'outline'}
                      onClick={() => setAlertType('technical_signal')}
                      className="gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      Signal
                    </Button>
                  </div>
                </div>

                {(alertType === 'price_above' || alertType === 'price_below') && (
                  <div>
                    <Label htmlFor="targetPrice">Target Price (USD)</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder={`Current: $${currentPrice?.toFixed(2)}`}
                      required
                    />
                  </div>
                )}

                {alertType === 'percent_change' && (
                  <div>
                    <Label htmlFor="percentChange">Percent Change (%)</Label>
                    <Input
                      id="percentChange"
                      type="number"
                      step="0.1"
                      value={percentChange}
                      onChange={(e) => setPercentChange(e.target.value)}
                      placeholder="e.g., 5 for 5% change"
                      required
                    />
                  </div>
                )}

                {alertType === 'technical_signal' && (
                  <div>
                    <Label>Technical Signal</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        type="button"
                        variant={technicalSignal === 'buy' ? 'default' : 'outline'}
                        onClick={() => setTechnicalSignal('buy')}
                      >
                        Buy Signal
                      </Button>
                      <Button
                        type="button"
                        variant={technicalSignal === 'sell' ? 'default' : 'outline'}
                        onClick={() => setTechnicalSignal('sell')}
                      >
                        Sell Signal
                      </Button>
                      <Button
                        type="button"
                        variant={technicalSignal === 'rsi_oversold' ? 'default' : 'outline'}
                        onClick={() => setTechnicalSignal('rsi_oversold')}
                      >
                        RSI Oversold
                      </Button>
                      <Button
                        type="button"
                        variant={technicalSignal === 'rsi_overbought' ? 'default' : 'outline'}
                        onClick={() => setTechnicalSignal('rsi_overbought')}
                      >
                        RSI Overbought
                      </Button>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Alert'
                  )}
                </Button>
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
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-lg border ${
                  alert.isTriggered
                    ? 'bg-green-500/10 border-green-500/50'
                    : alert.isActive
                    ? 'bg-card'
                    : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alert.coinSymbol.toUpperCase()}</span>
                      {alert.isTriggered && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">
                          Triggered
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.alertType === 'price_above' && `Price above $${alert.targetPrice}`}
                      {alert.alertType === 'price_below' && `Price below $${alert.targetPrice}`}
                      {alert.alertType === 'percent_change' && `${alert.percentChange}% change`}
                      {alert.alertType === 'technical_signal' && `${alert.technicalSignal?.replace('_', ' ')}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: ${alert.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMutation.mutate({ alertId: alert._id, isActive: !alert.isActive })}
                      disabled={toggleMutation.isPending || alert.isTriggered}
                    >
                      <Bell className={`w-4 h-4 ${alert.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(alert._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No alerts set</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Create an alert to get notified about price changes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
