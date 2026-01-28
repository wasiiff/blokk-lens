"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Send,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Zap,
  Target,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMarkdown from './ChatMarkdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down' | null;
}

interface CoinData {
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
}

interface CoinAnalysisChatProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinData?: CoinData;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SuggestedPrompt {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  category: string;
  gradient: string;
}

function CoinAnalysisChat({ 
  coinId, 
  coinSymbol, 
  coinName,
  coinData,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CoinAnalysisChatProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const [sessionId] = useState(() => `session_${coinId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Context-aware suggested prompts based on the current coin
  const SUGGESTED_PROMPTS: SuggestedPrompt[] = useMemo(() => [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Price Analysis",
      prompt: `Analyze the current ${coinName} (${coinSymbol.toUpperCase()}) price trend and provide trading insights`,
      category: "Analysis",
      gradient: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40"
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      title: "Technical Indicators",
      prompt: `What do the RSI, MACD, and Moving Averages indicate for ${coinSymbol.toUpperCase()} right now?`,
      category: "Indicators",
      gradient: "from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Entry/Exit Points",
      prompt: `What are good entry and exit points for ${coinSymbol.toUpperCase()} based on current market conditions?`,
      category: "Strategy",
      gradient: "from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40"
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      title: "Risk Assessment",
      prompt: `What are the key risks and support/resistance levels for ${coinSymbol.toUpperCase()}?`,
      category: "Risk",
      gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Market Outlook",
      prompt: `Based on current data, what's the short-term outlook for ${coinSymbol.toUpperCase()}?`,
      category: "Prediction",
      gradient: "from-indigo-500/10 to-violet-500/10 border-indigo-500/20 hover:border-indigo-500/40"
    },
    {
      icon: <Activity className="w-4 h-4" />,
      title: "Volume Analysis",
      prompt: `Analyze the trading volume patterns for ${coinSymbol.toUpperCase()} and what they indicate`,
      category: "Analysis",
      gradient: "from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40"
    },
  ], [coinName, coinSymbol]);

  // Initialize welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const priceInfo = coinData?.price 
        ? ` Currently trading at $${coinData.price.toLocaleString()}${coinData.priceChange24h ? ` (${coinData.priceChange24h >= 0 ? '+' : ''}${coinData.priceChange24h.toFixed(2)}% 24h)` : ''}.`
        : '';
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hello! I'm your AI trading assistant for **${coinName}** (${coinSymbol.toUpperCase()}).${priceInfo}

I can help you with:
- 📊 **Technical Analysis** - RSI, MACD, Moving Averages
- 📈 **Price Predictions** - Based on historical patterns  
- 🎯 **Entry/Exit Points** - Strategic trading levels
- ⚠️ **Risk Assessment** - Support/resistance and volatility

What would you like to know about ${coinSymbol.toUpperCase()}?`,
      }]);
    }
  }, [isOpen, messages.length, coinName, coinSymbol, coinData]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  }, []);

  const handleCopy = useCallback(async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleFeedback = useCallback((messageId: string, feedback: 'up' | 'down') => {
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, feedback: m.feedback === feedback ? null : feedback }
        : m
    ));
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/trading-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
          coinId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      const assistantId = `assistant-${Date.now()}`;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          
          setMessages(prev => {
            const existing = prev.find(m => m.id === assistantId);
            if (existing) {
              return prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: assistantMessage }
                  : m
              );
            } else {
              return [...prev, {
                id: assistantId,
                role: 'assistant' as const,
                content: assistantMessage,
              }];
            }
          });
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again.',
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isLoading, messages, sessionId, coinId]);

  const handleRegenerate = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.filter((m, i) => i < prev.length - 1 || m.role !== 'assistant'));
      setInputValue(lastUserMessage.content);
    }
  }, [messages]);

  const showSuggestions = useMemo(() => messages.length <= 1, [messages.length]);

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="w-4 h-4" />
        <span className="hidden sm:inline">Ask AI</span>
        <span className="sm:hidden">AI</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-primary font-medium">
          <Zap className="w-2.5 h-2.5 inline -mt-0.5" />
        </span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[480px] p-0 flex flex-col gap-0">
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <div className="flex items-center gap-3 pr-8">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base font-bold flex items-center gap-2">
                  AI Trading Assistant
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </SheetTitle>
                <SheetDescription className="text-xs flex items-center gap-1.5">
                  Analyzing 
                  <span className="font-semibold text-foreground">{coinSymbol.toUpperCase()}</span>
                  {coinData?.price && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium">${coinData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      {coinData.priceChange24h !== undefined && (
                        <span className={cn(
                          "font-medium flex items-center gap-0.5",
                          coinData.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {coinData.priceChange24h >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(coinData.priceChange24h).toFixed(2)}%
                        </span>
                      )}
                    </>
                  )}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "group relative flex flex-col gap-1",
                    message.role === 'user' ? 'items-end max-w-[85%]' : 'items-start max-w-[90%]'
                  )}>
                    <div className={cn(
                      "rounded-2xl px-4 py-3 relative",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/50 border border-border/50 rounded-bl-md'
                    )}>
                      {message.role === 'assistant' ? (
                        <ChatMarkdown>{message.content}</ChatMarkdown>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {/* Message Actions */}
                    {message.role === 'assistant' && message.id !== 'welcome' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => handleCopy(message.content, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-7 w-7 rounded-full",
                            message.feedback === 'up' && "text-green-500 bg-green-500/10"
                          )}
                          onClick={() => handleFeedback(message.id, 'up')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-7 w-7 rounded-full",
                            message.feedback === 'down' && "text-red-500 bg-red-500/10"
                          )}
                          onClick={() => handleFeedback(message.id, 'down')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Suggested Prompts */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2"
              >
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_PROMPTS.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                      className={cn(
                        "text-left p-3 rounded-xl border bg-gradient-to-br transition-all group",
                        suggestion.gradient
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-lg bg-background/50 backdrop-blur-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {suggestion.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs mb-0.5">{suggestion.title}</div>
                          <span className="text-[10px] text-muted-foreground">{suggestion.category}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-background p-4">
            {messages.length > 2 && !isLoading && (
              <div className="flex justify-center mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Regenerate response
                </Button>
              </div>
            )}
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask about ${coinSymbol.toUpperCase()}...`}
                className="flex-1 h-11 rounded-xl bg-muted/50 border-border/50 focus-visible:ring-primary/20"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              AI insights • Not financial advice • DYOR
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default memo(CoinAnalysisChat);
