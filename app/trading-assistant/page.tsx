import { Suspense } from 'react';
import { Metadata } from 'next';
import TradingAssistantRedesigned from '@/components/trading-assistant/TradingAssistantRedesigned';

export const metadata: Metadata = {
  title: 'AI Trading Assistant | BlokLens',
  description: 'Get AI-powered trading insights, technical analysis, and market predictions for cryptocurrencies',
};

export default function TradingAssistantPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-background">Loading...</div>}>
      <TradingAssistantRedesigned />
    </Suspense>
  );
}
