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
  ArrowLeft,
  Info,
  ArrowUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMarkdown from './ChatMarkdown';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/theme-toggle';

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
    gradient: "",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Technical Indicators",
    prompt: "Explain RSI, MACD, and Moving Averages for Ethereum",
    gradient: "",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Entry & Exit Points",
    prompt: "What are good entry and exit points for the top 10 cryptocurrencies?",
    gradient: "",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Risk Management",
    prompt: "How should I manage risk when trading volatile altcoins?",
    gradient: "",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Portfolio Strategy",
    prompt: "Suggest a balanced crypto portfolio for moderate risk tolerance",
    gradient: "",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Market Trends",
    prompt: "What are the current market trends and which coins show strong momentum?",
    gradient: "",
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
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: coinId 
          ? `Ready to analyze **${coinSymbol?.toUpperCase()}** for you.\n\nI can provide technical analysis, price predictions, and trading strategies. What would you like to explore?`
          : `I'm your **AI Trading Assistant** powered by BlokLens.\n\nI specialize in:\n- **Technical Analysis** - RSI, MACD, Moving Averages\n- **Price Predictions** - Based on historical patterns\n- **Entry/Exit Points** - Strategic trading levels\n- **Risk Assessment** - Support/resistance and volatility\n- **Portfolio Advice** - Diversification strategies\n\nWhat would you like to know about crypto trading?`,
      }]);
    }
  }, [coinId, coinSymbol, messages.length]);

  const loadChatHistory = useCallback(async () => {
    if (!session?.user) return;
    
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
  }, [session]);

  // Load chat history for authenticated users
  useEffect(() => {
    if (session?.user) {
      loadChatHistory();
    }
  }, [session, loadChatHistory]);

  const loadChatSession = async (sid: string) => {
    try {
      const res = await fetch(`/api/chat-history?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.messages) {
          // Map messages to ensure they have proper IDs
          const loadedMessages = data.messages.map((msg: any, idx: number) => ({
            id: msg.id || msg._id || `${msg.role}-${sid}-${idx}`,
            role: msg.role,
            content: msg.content,
            feedback: msg.feedback,
          }));
          setMessages(loadedMessages);
          setSessionId(sid);
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  };

  const deleteChatSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(sid);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    
    try {
      const res = await fetch(`/api/chat-history?sessionId=${sessionToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChatHistory(prev => prev.filter(chat => chat.sessionId !== sessionToDelete));
        if (sessionToDelete === sessionId) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    } finally {
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  const startNewChat = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setMessages([{
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: coinId 
        ? `Ready to analyze **${coinSymbol?.toUpperCase()}** for you.\n\nI can provide technical analysis, price predictions, and trading strategies. What would you like to explore?`
        : `I'm your **AI Trading Assistant** powered by BlokLens.\n\nI specialize in:\n- **Technical Analysis** - RSI, MACD, Moving Averages\n- **Price Predictions** - Based on historical patterns\n- **Entry/Exit Points** - Strategic trading levels\n- **Risk Assessment** - Support/resistance and volatility\n- **Portfolio Advice** - Diversification strategies\n\nWhat would you like to know about crypto trading?`,
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

      // Reload chat history after message is complete (for authenticated users)
      if (session?.user) {
        // Small delay to ensure backend has saved the chat
        setTimeout(() => {
          loadChatHistory();
        }, 500);
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
  }, [inputValue, isLoading, messages, sessionId, coinId, session, loadChatHistory]);

  const handleFeedback = useCallback((messageId: string, feedback: 'up' | 'down') => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
    ));
  }, []);

  const showSuggestions = useMemo(() => messages.length <= 1, [messages.length]);

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-background via-background to-muted/20">
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => setShowWelcomeModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center p-2">
                      <Logo size="sm" className="w-7 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome to BlokLens AI</h2>
                  </div>
                  <p className="text-muted-foreground">Your intelligent trading assistant</p>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1"  data-lenis-prevent>
                  {/* Current Features */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Current Features</h3>
                    </div>
                    <div className="space-y-3 ml-10">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Technical Analysis</p>
                          <p className="text-sm text-muted-foreground">RSI, MACD, Moving Averages and more</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Price Predictions</p>
                          <p className="text-sm text-muted-foreground">Based on historical patterns and market data</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Entry & Exit Points</p>
                          <p className="text-sm text-muted-foreground">Strategic trading levels and timing</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Risk Assessment</p>
                          <p className="text-sm text-muted-foreground">Support/resistance and volatility analysis</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Portfolio Advice</p>
                          <p className="text-sm text-muted-foreground">Diversification strategies and recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Note */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-500 mb-1">Important Note</p>
                        <p className="text-sm text-muted-foreground">
                          Right now, I provide trading suggestions and strategies to help you make informed decisions. 
                          I'm continuously learning and improving to offer even better insights!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Coming Soon */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Coming Soon</h3>
                    </div>
                    <div className="space-y-3 ml-10">
                      <div className="flex items-start gap-3">
                        <Bitcoin className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Coin-Specific AI Analysis</p>
                          <p className="text-sm text-muted-foreground">Deep dive into individual cryptocurrencies with tailored insights</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <LineChart className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Real-Time Trading Signals</p>
                          <p className="text-sm text-muted-foreground">Get instant notifications for trading opportunities</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Bot className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Advanced Trading Automation</p>
                          <p className="text-sm text-muted-foreground">Execute trades based on AI recommendations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <PieChart className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Enhanced Market Analytics</p>
                          <p className="text-sm text-muted-foreground">More comprehensive data analysis and insights</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Disclaimer</p>
                    <p>
                      Always do your own research (DYOR) and never invest more than you can afford to lose. 
                      This is not financial advice.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border/50 shrink-0">
                  <Button
                    onClick={() => setShowWelcomeModal(false)}
                    className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90"
                  >
                    Got it, let's start!
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

          {/* Header with centered logo and title */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-muted"
                onClick={() => window.location.href = '/'}
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
                <Logo size="sm" className="w-6 h-5" />
                <h1 className="text-base font-bold tracking-tight">BLOKK LENS AI</h1>
              </div>

              <ThemeToggle />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">Trading Assistant</p>
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
          <div className="flex-1 overflow-y-auto px-4 pb-4" data-lenis-prevent>
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
                    
                    {/* Delete button and confirmation popover */}
                    <div className="relative">
                      {sessionToDelete === chat.sessionId ? (
                        <div className="absolute right-0 top-0 z-50 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-2 animate-in fade-in zoom-in-95 duration-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelDelete();
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete();
                            }}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => deleteChatSession(chat.sessionId, e)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Messages Area - THIS IS THE SCROLLABLE PART */}
        <div className="flex-1 overflow-y-scroll relative" data-lenis-prevent>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto px-6 py-8 relative z-10">
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
                    {message.role === 'assistant' ? (
                      // AI message - left aligned
                      <>
                        {/* Message Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center p-1">
                            <Logo size="sm" className="w-5 h-4" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">BlokLens AI</span>
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
                      // User message - right aligned
                      <div className="flex flex-col items-end">
                        {/* Message Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-medium">{session?.user?.name || 'You'}</span>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        {/* Message Content */}
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
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center p-1">
                      <Logo size="sm" className="w-5 h-4" />
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
                  {/* Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUGGESTED_PROMPTS.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const prompt = coinId && coinSymbol 
                            ? suggestion.prompt.replace(/Bitcoin|Ethereum|top 10 cryptocurrencies/gi, coinSymbol.toUpperCase() || 'this coin')
                            : suggestion.prompt;
                          handleSuggestedPrompt(prompt);
                        }}
                        className="group relative text-left p-5 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-border hover:bg-card/60 transition-all duration-300"
                      >
                        <div className="relative flex items-start gap-4">
                          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 text-muted-foreground group-hover:text-foreground transition-colors">
                            {suggestion.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {suggestion.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {coinId && coinSymbol ? suggestion.prompt.replace(/Bitcoin|Ethereum|top 10 cryptocurrencies/gi, coinSymbol.toUpperCase() || 'this coin') : suggestion.prompt}
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
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
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
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default memo(TradingAssistant);
