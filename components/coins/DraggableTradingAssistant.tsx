"use client";

import { useState, useRef, useEffect, memo } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import TradingAssistantRedesigned from '@/components/trading-assistant/TradingAssistantRedesigned';

interface DraggableTradingAssistantProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  currentPrice?: number;
}

function DraggableTradingAssistant({ coinId, coinSymbol }: DraggableTradingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragControls = useDragControls();
  
  // Ref for the constraints (optional, here we allow free drag)
  const constraintsRef = useRef(null);

  // Toggle open
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 relative group p-0"
        >
          <div className="relative flex items-center justify-center w-full h-full">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-card border border-border rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg font-medium">
            Chat with {coinSymbol.toUpperCase()} AI
          </div>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false} // Only drag from header
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        height: isMinimized ? 'auto' : '600px',
        width: isMinimized ? '300px' : '400px',
      }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "fixed bottom-24 right-6 z-50 flex flex-col",
        "bg-background border border-border rounded-xl shadow-2xl overflow-hidden",
        "resize-y" // Allow CSS resizing vertical
      )}
      style={{
        width: isMinimized ? 300 : 400,
        height: isMinimized ? 'auto' : 600,
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      {/* Draggable Header */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border cursor-grab active:cursor-grabbing shrink-0 select-none"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground/50" />
          <h3 className="text-xs font-semibold flex items-center gap-1.5">
            AI Assistant
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
              {coinSymbol.toUpperCase()}
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {!isMinimized && (
        <div className="flex-1 w-full h-full overflow-hidden relative">
          <TradingAssistantRedesigned 
            coinId={coinId} 
            coinSymbol={coinSymbol} 
            isEmbedded={true}
            forceMobile={true} 
          />
        </div>
      )}
    </motion.div>
  );
}

export default memo(DraggableTradingAssistant);
