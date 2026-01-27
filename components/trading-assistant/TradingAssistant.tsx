"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Send,
  TrendingUp,
  BarChart3,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Target,
  Shield,
  Brain,
  Loader2,
  Zap,
  LineChart,
  PieChart,
  Menu,
  X,
  MessageSquare,
  Trash2,
  Clock,
  Bitcoin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMarkdown from './ChatMarkdown';
import { useSession } from 'next-auth/react';

interface SuggestedPrompt {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  gradient: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down' | null;
}

interface ChatSession {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    icon: <Bitcoin className="w-5 h-5" />,
    title: "Bitcoin Analysis",
    prompt: "Analyze the current Bitcoin price trend and provide trading insights",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Technical Indicators",
    prompt: "Explain RSI, MACD, and Moving Averages for Ethereum",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Entry & Exit Points",
    prompt: "What are good entry and exit points for the top 10 cryptocurrencies?",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Risk Management",
    prompt: "How should I manage risk when trading volatile altcoins?",
    gradient: "from-rose-500 to-red-500",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Portfolio Strategy",
    prompt: "Suggest a balanced crypto portfolio for moderate risk tolerance",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Market Trends",
    prompt: "What are the current market trends and which coins show strong momentum?",
    gradient: "from-purple-500 to-pink-500",
  },
];

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

interface TradingAssistantProps {
  coinId?: string;
  coinSymbol?: string;
}

function TradingAssistant({ coinId, coinSymbol }: TradingAssistantProps) {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: coinId 
          ? `Hey! 👋 Ready to analyze **${coinSymbol?.toUpperCase()}** for you.\n\nI can provide technical analysis, price predictions, and trading strategies. What would you like to explore?`
          : `Hey! 👋 I'm your **AI Trading Assistant** powered by BlokLens.\n\nI specialize in:\n- 📊 **Technical Analysis** - RSI, MACD, Moving Averages\n- 📈 **Price Predictions** - Based on historical patterns\n- 🎯 **Entry/Exit Points** - Strategic trading levels\n- ⚠️ **Risk Assessment** - Support/resistance and volatility\n- 💡 **Portfolio Advice** - Diversification strategies\n\nWhat would you like to know about crypto trading?`,
      }]);
    }
  }, [coinId, coinSymbol, messages.length]);

  // Load chat history for authenticated users
  useEffect(() => {
    if (session?.user && !loadingHistory) {
      loadChatHistory();
    }
  }, [session]);

  const loadChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/chat-history');
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat-history?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setSessionId(sessionId);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  };

  const deleteChatSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    
    try {
      const res = await fetch(`/api/chat-history?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChatHistory(prev => prev.filter(chat => chat.sessionId !== sessionId));
        if (sessionId === sessionId) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  };

  const startNewChat = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: coinId 
        ? `Hey! 👋 Ready to analyze **${coinSymbol?.toUpperCase()}** for you.\n\nI can provide technical analysis, price predictions, and trading strategies. What would you like to explore?`
        : `Hey! 👋 I'm your **AI Trading Assistant** powered by BlokLens.\n\nI specialize in:\n- 📊 **Technical Analysis** - RSI, MACD, Moving Averages\n- 📈 **Price Predictions** - Based on historical patterns\n- 🎯 **Entry/Exit Points** - Strategic trading levels\n- ⚠️ **Risk Assessment** - Support/resistance and volatility\n- 💡 **Portfolio Advice** - Diversification strategies\n\nWhat would you like to know about crypto trading?`,
    }]);
    setInputValue('');
    setSidebarOpen(false);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  }, []);

  const handleCopy = useCallback(async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
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
          sessionId,
          coinId,
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
  }, [inputValue, isLoading, messages, sessionId, coinId]);

  const handleFeedback = useCallback((messageId: string, feedback: 'up' | 'down') => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
    ));
  }, []);

  const handleRegenerate = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.filter((_, i) => i < prev.length - 1));
      setInputValue(lastUserMessage.content);
    }
  }, [messages]);

  const showSuggestions = useMemo(() => messages.length <= 1, [messages.length]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className={cn(
          "w-64 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "fixed lg:relative inset-y-0 left-0 z-50"
        )}>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              BlokLens AI
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Trading Assistant</p>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={startNewChat}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              New chat
            </Button>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Recent Conversations
            </div>
            
            {loadingHistory ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : chatHistory.length > 0 ? (
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.sessionId}
                    className={cn(
                      "group relative flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
                      chat.sessionId === sessionId && "bg-muted/70"
                    )}
                    onClick={() => loadChatSession(chat.sessionId)}
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => deleteChatSession(chat.sessionId, e)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start chatting to see history</p>
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-border/50">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{session.user.name || session.user.email}</div>
                  <div className="text-xs text-muted-foreground">Authenticated</div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Sign in to save conversations</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/auth/login'}>
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile menu button */}
          <div className="lg:hidden p-4 border-b border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto relative">
            <div className="max-w-3xl mx-auto px-6 py-8">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-8"
                  >
                    {/* Message Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {message.role === 'assistant' ? (
                        <>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">BlokLens AI</span>
                        </>
                      ) : (
                        <>
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{session?.user?.name || 'You'}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={cn(
                      "group relative pl-10",
                      message.role === 'user' ? 'max-w-full' : 'max-w-full'
                    )}>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.role === 'assistant' ? (
                          <ChatMarkdown>{message.content}</ChatMarkdown>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Message Actions */}
                      {message.role === 'assistant' && message.id !== 'welcome' && (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md hover:bg-muted"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">BlokLens AI</span>
                  </div>
                  <div className="pl-10">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-muted-foreground">Analyzing market data...</span>
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
                  className="mt-8"
                >
                  {/* Title Section */}
                  <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Quick Start</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {coinId ? `Analyze ${coinSymbol?.toUpperCase()}` : 'What would you like to explore?'}
                    </h2>
                    <p className="text-muted-foreground">
                      {coinId ? 'Get AI-powered insights for your trading decisions' : 'Select a topic or ask your own question'}
                    </p>
                  </motion.div>

                  {/* Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUGGESTED_PROMPTS.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestedPrompt(coinId ? suggestion.prompt.replace(/Bitcoin|Ethereum|top 10 cryptocurrencies/gi, coinSymbol?.toUpperCase() || 'this coin') : suggestion.prompt)}
                        className="group relative text-left p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/40 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                      >
                        {/* Gradient overlay on hover */}
                        <div className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br",
                          suggestion.gradient
                        )} />
                        
                        <div className="relative flex items-start gap-4">
                          <div className={cn(
                            "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                            suggestion.gradient
                          )}>
                            {suggestion.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {suggestion.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {coinId ? suggestion.prompt.replace(/Bitcoin|Ethereum|top 10 cryptocurrencies/gi, coinSymbol?.toUpperCase() || 'this coin') : suggestion.prompt}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Feature Pills */}
                  <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mt-8">
                    {[
                      { icon: <LineChart className="w-4 h-4" />, label: "Technical Analysis" },
                      { icon: <TrendingUp className="w-4 h-4" />, label: "Price Predictions" },
                      { icon: <PieChart className="w-4 h-4" />, label: "Portfolio Advice" },
                      { icon: <Shield className="w-4 h-4" />, label: "Risk Management" },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm text-muted-foreground"
                      >
                        {feature.icon}
                        {feature.label}
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="relative border-t border-border/50 bg-background/95 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto p-6">
              <form onSubmit={handleFormSubmit} className="relative">
                <div className="relative flex items-center gap-3 bg-muted/50 rounded-2xl px-4 py-3 border border-border/50 focus-within:border-primary/50 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={coinId ? `Ask about ${coinSymbol?.toUpperCase()} trading...` : "Ask about crypto trading, technical analysis, or market insights..."}
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
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Bot className="w-3 h-3" />
                <span>AI-powered insights • Not financial advice • Always DYOR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TradingAssistant);
