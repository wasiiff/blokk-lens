"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Send,
  TrendingUp,
  BarChart3,
  Sparkles,
  History,
  Trash2,
  Plus,
  Bot,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestedPrompt {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  category: string;
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
    category: "Analysis"
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    title: "Technical Indicators",
    prompt: "Explain RSI, MACD, and Moving Averages for Ethereum",
    category: "Education"
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Market Prediction",
    prompt: "Based on historical data, what's your prediction for Solana in the next week?",
    category: "Prediction"
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    title: "Entry/Exit Points",
    prompt: "What are good entry and exit points for Cardano right now?",
    category: "Strategy"
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    title: "Risk Management",
    prompt: "How should I manage risk when trading volatile altcoins?",
    category: "Education"
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Portfolio Advice",
    prompt: "Suggest a balanced crypto portfolio for a moderate risk tolerance",
    category: "Strategy"
  },
];

interface TradingAssistantProps {
  coinId?: string;
  coinSymbol?: string;
}

export default function TradingAssistant({ coinId, coinSymbol }: TradingAssistantProps) {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(
    coinId ? [{
      id: 'welcome',
      role: 'assistant' as const,
      content: `Hello! I'm your AI trading assistant. I can help you analyze ${coinSymbol?.toUpperCase() || 'cryptocurrencies'}, understand technical indicators, and make informed trading decisions. What would you like to know?`,
    }] : []
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Trading Assistant</h1>
              <p className="text-sm text-muted-foreground">
                {coinSymbol ? `Analyzing ${coinSymbol.toUpperCase()}` : 'Powered by advanced market analysis'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={cn(
                "group relative max-w-[80%] rounded-2xl px-4 py-3",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.content}
                </div>
                
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex gap-1">
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
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground text-center">
              Try asking me about:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUGGESTED_PROMPTS.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                  className="text-left p-4 rounded-xl border bg-card hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{suggestion.title}</span>
                        <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
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
      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={handleInputChangeLocal}
              placeholder="Ask about trading strategies, technical analysis, or market predictions..."
              className="flex-1 h-12 rounded-xl"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl"
              disabled={isLoading || !inputValue || !inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI-powered insights • Not financial advice • Always DYOR
          </p>
        </form>
      </div>
    </div>
  );
}
