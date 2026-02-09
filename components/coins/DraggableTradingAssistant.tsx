"use client";

import { useState, useRef, useEffect, memo } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Maximize2, Minimize2, GripHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import TradingAssistantRedesigned from '@/components/trading-assistant/TradingAssistantRedesigned';
import { useRouter } from 'next/navigation';

interface DraggableTradingAssistantProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  currentPrice?: number;
  isOpen: boolean;
  onClose: () => void;
}

function DraggableTradingAssistant({ 
  coinId, 
  coinSymbol, 
  isOpen, 
  onClose 
}: DraggableTradingAssistantProps) {
  /* Shared state */
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle outside clicks to minimize
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen && 
        !isMinimized && 
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMinimized(true);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMinimized]);

  const handleOpenFullChat = () => {
    const url = currentSessionId 
      ? `/trading-assistant?sessionId=${currentSessionId}` 
      : '/trading-assistant';
    router.push(url);
  };

  return (
    <>
      {/* Constraints Container - Full screen inset to keep component inside */}
      <div 
        ref={constraintsRef} 
        className="fixed inset-4 pointer-events-none z-0" 
      />

      <motion.div
        ref={containerRef}
        drag
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragListener={false} // Explicitly start drag on specific elements (Header)
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={isOpen ? { 
          opacity: 1,
          scale: 1, 
          y: 0,
        } : { opacity: 0, scale: 0.95, y: 20 }}
        className={cn(
          "fixed bottom-24 right-6 z-50 flex flex-col",
          "bg-background shadow-2xl overflow-hidden border border-border",
          isMinimized ? "rounded-full" : "rounded-xl",
          !isOpen && "pointer-events-none" 
        )}
        style={{
          resize: isMinimized ? 'none' : 'both',
          minWidth: isMinimized ? 'fit-content' : '320px',
          minHeight: isMinimized ? 'fit-content' : '400px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 120px)',
          width: isMinimized ? 'auto' : '400px',
          height: isMinimized ? 'auto' : '600px',
          display: isOpen ? 'flex' : 'none',
        }}
      >
        {/* Draggable Header / Chat Bubble */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className={cn(
            "flex items-center justify-between px-3 py-2 bg-muted/40 cursor-grab active:cursor-grabbing shrink-0 select-none touch-none",
            !isMinimized && "border-b border-border"
          )}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-muted-foreground/50" />
            <h3 className="text-xs font-semibold flex items-center gap-1.5">
              {!isMinimized && "AI Assistant"}
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                {coinSymbol.toUpperCase()}
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-1 ml-4">
             {/* Open in Main App functionality */}
             {!isMinimized && (
               <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenFullChat}
                className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                title="Open full chat"
              >
                <ExternalLink className="w-3.5 h-3.5" /> 
              </Button>
             )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </Button>
            {!isMinimized && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {!isMinimized && (
          <div className="flex-1 w-full h-full overflow-hidden relative bg-background">
            <TradingAssistantRedesigned 
              coinId={coinId} 
              coinSymbol={coinSymbol} 
              isEmbedded={true}
              forceMobile={true}
              onSessionIdChange={setCurrentSessionId} 
            />
          </div>
        )}
      </motion.div>
    </>
  );
}

export default memo(DraggableTradingAssistant);
