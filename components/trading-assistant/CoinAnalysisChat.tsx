"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Bot } from 'lucide-react';
import TradingAssistant from './TradingAssistant';

interface CoinAnalysisChatProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
}

export default function CoinAnalysisChat({ coinId, coinSymbol, coinName }: CoinAnalysisChatProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bot className="w-4 h-4" />
          Ask AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Analysis for {coinName}
          </DialogTitle>
        </DialogHeader>
        <div className="h-full overflow-hidden">
          <TradingAssistant coinId={coinId} coinSymbol={coinSymbol} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
