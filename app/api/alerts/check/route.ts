import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PriceAlert from '@/models/PriceAlert';
import { TradingAnalyzer } from '@/services/trading-analysis';

/**
 * Alert Checker - Runs periodically to check if alerts should be triggered
 * This should be called by a cron job or scheduled task
 */
export async function POST(req: NextRequest) {
  try {
    // Verify this is an internal request (add authentication for production)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all active, non-triggered alerts
    const alerts = await PriceAlert.find({
      isActive: true,
      isTriggered: false,
    });

    if (alerts.length === 0) {
      return NextResponse.json({ message: 'No alerts to check', checked: 0 });
    }

    // Group alerts by coinId to minimize API calls
    const alertsByCoin = alerts.reduce((acc, alert) => {
      if (!acc[alert.coinId]) acc[alert.coinId] = [];
      acc[alert.coinId].push(alert);
      return acc;
    }, {} as Record<string, typeof alerts>);

    const triggeredAlerts: any[] = [];

    // Check each coin
    for (const [coinId, coinAlerts] of Object.entries(alertsByCoin)) {
      try {
        // Fetch current price
        const priceResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
          {
            headers: process.env.COINGECKO_API_KEY
              ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
              : {},
          }
        );

        const priceData = await priceResponse.json();
        const currentPrice = priceData[coinId]?.usd;
        const priceChange24h = priceData[coinId]?.usd_24h_change;

        if (!currentPrice) continue;

        // For technical signal alerts, fetch price history
        let technicalSignals: any = null;
        const technicalAlerts = coinAlerts.filter((a) => a.alertType === 'technical_signal');

        if (technicalAlerts.length > 0) {
          const chartResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=90&interval=daily`,
            {
              headers: process.env.COINGECKO_API_KEY
                ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
                : {},
            }
          );

          const chartData = await chartResponse.json();
          const prices = chartData.prices?.map((p: [number, number]) => p[1]) || [];

          if (prices.length > 0) {
            const indicators = TradingAnalyzer.analyzePriceData(prices);
            technicalSignals = TradingAnalyzer.generateSignals(indicators, currentPrice);
            technicalSignals.rsi = indicators.rsi;
          }
        }

        // Check each alert for this coin
        for (const alert of coinAlerts) {
          let shouldTrigger = false;

          switch (alert.alertType) {
            case 'price_above':
              shouldTrigger = currentPrice >= (alert.targetPrice || 0);
              break;

            case 'price_below':
              shouldTrigger = currentPrice <= (alert.targetPrice || 0);
              break;

            case 'percent_change':
              shouldTrigger = Math.abs(priceChange24h || 0) >= Math.abs(alert.percentChange || 0);
              break;

            case 'technical_signal':
              if (technicalSignals) {
                if (alert.technicalSignal === 'buy') {
                  shouldTrigger = technicalSignals.signal === 'buy' && technicalSignals.confidence > 60;
                } else if (alert.technicalSignal === 'sell') {
                  shouldTrigger = technicalSignals.signal === 'sell' && technicalSignals.confidence > 60;
                } else if (alert.technicalSignal === 'rsi_oversold') {
                  shouldTrigger = technicalSignals.rsi < 30;
                } else if (alert.technicalSignal === 'rsi_overbought') {
                  shouldTrigger = technicalSignals.rsi > 70;
                }
              }
              break;
          }

          if (shouldTrigger) {
            alert.isTriggered = true;
            alert.triggeredAt = new Date();
            alert.currentPrice = currentPrice;
            await alert.save();

            triggeredAlerts.push({
              alertId: alert._id,
              userId: alert.userId,
              coinId: alert.coinId,
              coinSymbol: alert.coinSymbol,
              alertType: alert.alertType,
              currentPrice,
              targetPrice: alert.targetPrice,
              technicalSignal: alert.technicalSignal,
            });
          }
        }
      } catch (error) {
        console.error(`Error checking alerts for ${coinId}:`, error);
      }
    }

    // In production, send notifications here (email, push, etc.)
    // For now, just return the triggered alerts

    return NextResponse.json({
      message: 'Alert check completed',
      checked: alerts.length,
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts,
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json({ error: 'Failed to check alerts' }, { status: 500 });
  }
}
