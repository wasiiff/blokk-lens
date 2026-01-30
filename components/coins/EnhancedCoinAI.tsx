"use client";

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2, 
  Sparkles,
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  Brain,
  Bitcoin,
  X,
  Minimize2,
  Maximize2,
  ArrowUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMarkdown from '@/components/trading-assistant/ChatMarkdown';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/ui/logo';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down' | null;
}

interface SuggestedPrompt {
  icon: React.ReactNode;
  title: string;
  prompt: string;
}

interface EnhancedCoinAIProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  currentPrice?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

function EnhancedCoinAI({ coinId, coinSymbol, coinName, currentPrice }: EnhancedCoinAIProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    {
      icon: <Bitcoin className="w-5 h-5" />,
      title: "Current Analysis",
      prompt: `Analyze the current ${coinSymbol.toUpperCase()} price trend and provide trading insights`,
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Technical Indicators",
      prompt: `What do the technical indicators (RSI, MACD, MA) say about ${coinSymbol.toUpperCase()}?`,
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Entry & Exit Points",
      prompt: `What are good entry and exit points for ${coinSymbol.toUpperCase()} right now?`,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Risk Assessment",
      prompt: `What are the risks of investing in ${coinSymbol.toUpperCase()} at current levels?`,
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Price Prediction",
      prompt: `Predict ${coinSymbol.toUpperCase()} price for the next 7 and 30 days`,
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Backtest Strategy",
      prompt: `Backtest a trading strategy for ${coinSymbol.toUpperCase()} over the last 90 days`,
    },
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `I'm your AI assistant for **${coinName} (${coinSymbol.toUpperCase()})**.${currentPrice ? `\n\nCurrent Price: **$${currentPrice.toLocaleString()}**` : ''}\n\nI can help you with:\n- 📊 **Technical Analysis** - RSI, MACD, Moving Averages\n- 📈 **Price Predictions** - 7-day and 30-day forecasts\n- 🎯 **Entry/Exit Strategies** - Optimal trading levels\n- ⚠️ **Risk Assessment** - Support/resistance analysis\n- 🔄 **Backtesting** - Test strategies on historical data\n- 💡 **Trading Recommendations** - Data-driven insights\n\nWhat would you like to know about ${coinSymbol.toUpperCase()}?`,
      }]);
    }
  }, [isOpen, messages.length, coinName, coinSymbol, currentPrice]);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleCopy = useCallback(async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleFeedback = useCallback((messageId: string, feedback: 'up' | 'down') => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
    ));
  }, []);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      form?.requestSubmit();
    }
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
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/trading-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId: `coin-${coinId}-${Date.now()}`,
          coinId,
          useAgent: true, // Use LangGraph agent for advanced analysis
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to get response');

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
              return prev.map(m => m.id === assistantId ? { ...m, content: assistantMessage } : m);
            }
            return [...prev, { id: assistantId, role: 'assistant' as const, content: assistantMessage }];
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
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
  }, [inputValue, isLoading, messages, coinId]);

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 relative group"
            >
              <div className="relative">
                <Sparkles className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-4 px-4 py-2 bg-card border border-border rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                <div className="font-semibold">Ask AI about {coinSymbol.toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">Powered by Vercel AI Gateway</div>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 'auto' : '85vh',
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 flex flex-col",
              "w-[500px] max-w-[calc(100vw-3rem)]",
              "bg-background/95 backdrop-blur-xl border-2 border-border/50 rounded-2xl shadow-2xl overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center p-1.5">
                  <Logo size="sm" className="w-7 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    {coinName} AI
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      {coinSymbol.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Powered by Vercel AI Gateway</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6" data-lenis-prevent>
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-6"
                      >
                        {message.role === 'assistant' ? (
                          <>
                            {/* AI Message Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center p-1">
                                <Logo size="sm" className="w-5 h-4" />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {coinSymbol.toUpperCase()} AI
                              </span>
                            </div>
                            
                            {/* Message Content */}
                            <div className="group relative pl-10">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ChatMarkdown>{message.content}</ChatMarkdown>
                              </div>
                              
                              {/* Message Actions */}
                              {!message.id.startsWith('welcome') && (
                                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-md hover:bg-muted"
                                    onClick={() => handleCopy(message.content, index)}
                                  >
                                    {copiedIndex === index ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-7 w-7 rounded-md hover:bg-muted", message.feedback === 'up' && "text-emerald-500")}
                                    onClick={() => handleFeedback(message.id, 'up')}
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-7 w-7 rounded-md hover:bg-muted", message.feedback === 'down' && "text-rose-500")}
                                    onClick={() => handleFeedback(message.id, 'down')}
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          // User Message
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-sm font-medium">{session?.user?.name || 'You'}</span>
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{message.content}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Loading State */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center p-1">
                          <Logo size="sm" className="w-5 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {coinSymbol.toUpperCase()} AI
                        </span>
                      </div>
                      <div className="pl-10">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">Analyzing {coinSymbol.toUpperCase()}...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Suggested Prompts */}
                  {showSuggestions && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={containerVariants}
                      className="mt-6"
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {SUGGESTED_PROMPTS.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                            className="group text-left p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-border hover:bg-card/60 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground group-hover:text-foreground transition-colors">
                                {suggestion.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors">
                                  {suggestion.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {suggestion.prompt}
                                </p>
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
                <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm p-4 shrink-0">
                  <form onSubmit={handleFormSubmit} className="relative">
                    <div className="relative flex items-center gap-3 bg-muted/50 rounded-2xl px-4 py-3 border border-border/50 focus-within:border-primary/50 transition-colors">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask about ${coinSymbol.toUpperCase()} trading...`}
                        rows={1}
                        className="flex-1 resize-none bg-transparent border-0 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 max-h-[120px]"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !inputValue.trim()}
                        className="h-9 w-9 rounded-full shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowUp className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(EnhancedCoinAI);
