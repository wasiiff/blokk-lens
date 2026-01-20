import { Metadata } from 'next';
import TradingAssistant from '@/components/trading-assistant/TradingAssistant';
import { BorderBeam } from '@/components/ui/borderbeam';

export const metadata: Metadata = {
  title: 'AI Trading Assistant | CryptoPulse',
  description: 'Get AI-powered trading insights, technical analysis, and market predictions for cryptocurrencies',
};

export default function TradingAssistantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col">
        <div className="relative mx-auto w-full max-w-(--breakpoint-xl) flex-1 border-dashed border-r border-l px-4 sm:px-8 overflow-hidden">
          <BorderBeam borderWidth={1} reverse initialOffset={10} className="from-transparent via-blue-500 to-transparent"/>
          <BorderBeam borderWidth={1} className="from-transparent via-blue-500 to-transparent"/>
          <TradingAssistant />
        </div>
      </div>
    </div>
  );
}
