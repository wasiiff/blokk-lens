"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  TrendingUp,
  BarChart3,
  Sparkles,
  Copy,
  Check,
  ArrowUp,
  Zap,
  Target,
  Shield,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { BorderBeam } from '@/components/ui/borderbeam';

interface SuggestedPrompt {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  category: string;
  gradient: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    icon: <TrendingUp className="w-4 h-4" />,
    title: "Analyze Bitcoin Trend",
    prompt: "Analyze the current Bitcoin price trend and provide trading insights",
    category: "Analysis",
    gradient: "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    title: "Technical Indicators",
    prompt: "Explain RSI, MACD, and Moving Averages for Ethereum",
    category: "Education",
    gradient: "from-purple-500/10 to-pink-500/10 border-purple-500/20"
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Market Prediction",
    prompt: "Based on historical data, what's your prediction for Solana in the next week?",
    category: "Prediction",
    gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/20"
  },
  {
    icon: <Target className="w-4 h-4" />,
    title: "Entry/Exit Points",
    prompt: "What are good entry and exit points for Cardano right now?",
    category: "Strategy",
    gradient: "from-green-500/10 to-emerald-500/10 border-green-500/20"
  },
  {
    icon: <Shield className="w-4 h-4" />,
    title: "Risk Management",
    prompt: "How should I manage risk when trading volatile altcoins?",
    category: "Education",
    gradient: "from-red-500/10 to-rose-500/10 border-red-500/20"
  },
  {
    icon: <Brain className="w-4 h-4" />,
    title: "Portfolio Advice",
    prompt: "Suggest a balanced crypto portfolio for a moderate risk tolerance",
    category: "Strategy",
    gradient: "from-indigo-500/10 to-violet-500/10 border-indigo-500/20"
  },
];

interface TradingAssistantPremiumProps {
  coinId?: string;
  coinSymbol?: string;
}

export default function TradingAssistantPremium({ coinId, coinSymbol }: TradingAssistantPremiumProps) {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(
    coinId ? [{
      id: 'welcome',
      role: 'assistant' as const,
      content: `Hello! I'm your AI trading assistant. I can help you analyze ${coinSymbol?.toUpperCase() || 'cryptocurrencies'}, understand technical indicators, and make informed trading decisions. What would you like to know?`,
    }] : [{
      id: 'welcome',
      role: 'assistant' as const,
      content: `Welcome to your AI Trading Assistant! I'm here to help you navigate the crypto markets with data-driven insights and technical analysis. Ask me anything about trading strategies, market trends, or specific cryptocurrencies.`,
    }]
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInputChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          messages: [...messages, userMessage],
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
          content: 'Sorry, I encountered an error. Please try again.',
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-border border-b border-dashed bg-background">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between border-border border-r border-l border-dashed px-4 sm:px-8 overflow-hidden">
          <BorderBeam borderWidth={1} reverse initialOffset={40} className="from-transparent via-blue-500 to-transparent" />
          <div className="flex items-center space-x-3 py-5">
            <Logo size="sm" />
            <div className="flex flex-col">
              <h1 className="font-bold text-lg">AI Trading Assistant</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-0.5">
                {coinSymbol ? `Analyzing ${coinSymbol.toUpperCase()}` : 'Powered by GPT-4'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">Live Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <div className="relative mx-auto w-full max-w-7xl flex-1 border-dashed border-r border-l px-4 sm:px-8 overflow-hidden">
          <BorderBeam borderWidth={1} reverse initialOffset={10} className="from-transparent via-blue-500 to-transparent"/>
          <BorderBeam borderWidth={1} className="from-transparent via-blue-500 to-transparent"/>
          
          <div className="min-h-[calc(100vh-12rem)] w-full pt-10 pb-20">
            {/* Messages Area */}
            <div className="space-y-8 mb-8">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-4 max-w-4xl",
                      message.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "group relative flex-1 max-w-[85%]",
                      message.role === 'user' && 'max-w-[75%]'
                    )}>
                      <div className={cn(
                        "rounded-2xl px-6 py-4 relative overflow-hidden",
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted/50 border border-border/50 backdrop-blur-sm'
                      )}>
                        {message.role === 'assistant' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none relative z-10">
                          {message.content}
                        </div>
                      </div>
                      
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg"
                          onClick={() => handleCopy(message.content, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-primary-foreground">You</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 max-w-4xl"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-muted/50 border border-border/50 backdrop-blur-sm rounded-2xl px-6 py-4">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-8"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Get Started</h2>
                    <p className="text-muted-foreground">Choose a prompt or ask your own question</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUGGESTED_PROMPTS.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                        className={cn(
                          "text-left p-5 rounded-xl border bg-gradient-to-br transition-all group relative overflow-hidden",
                          suggestion.gradient,
                          "hover:scale-105 hover:shadow-lg"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
                              {suggestion.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm mb-1">{suggestion.title}</div>
                              <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {suggestion.prompt}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-dashed border-border bg-background">
        <div className="relative mx-auto max-w-7xl border-r border-l border-dashed border-border px-4 sm:px-8 py-6 overflow-hidden">
          <BorderBeam borderWidth={1} reverse className="from-transparent via-blue-500 to-transparent" />
          <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
            <div className="relative flex gap-2 items-center bg-muted/30 border border-border rounded-2xl p-2 backdrop-blur-sm">
              <Input
                value={inputValue}
                onChange={handleInputChangeLocal}
                placeholder="Ask about trading strategies, technical analysis, or market predictions..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
                disabled={isLoading || !inputValue || !inputValue.trim()}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              AI-powered insights • Not financial advice • Always DYOR
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
