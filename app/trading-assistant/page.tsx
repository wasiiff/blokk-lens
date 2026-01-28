import { Metadata } from 'next';
import TradingAssistant from '@/components/trading-assistant/TradingAssistant';

export const metadata: Metadata = {
  title: 'AI Trading Assistant | CryptoPulse',
  description: 'Get AI-powered trading insights, technical analysis, and market predictions for cryptocurrencies',
};

export default function TradingAssistantPage() {
  return (
    <TradingAssistant />
  );
}
