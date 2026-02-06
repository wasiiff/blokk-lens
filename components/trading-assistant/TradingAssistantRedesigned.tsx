"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Send,
  TrendingUp,
  BarChart3,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Target,
  Brain,
  Loader2,
  PieChart,
  Menu,
  X,
  MessageSquare,
  Trash2,
  Clock,
  Bitcoin,
  PanelLeftClose,
  PanelLeft,
  Github,
  ArrowUp,
  Users,
  Plus,
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
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Technical Indicators",
    prompt: "Explain RSI, MACD, and Moving Averages for Ethereum",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Entry & Exit Points",
    prompt: "What are good entry and exit points for the top 10 cryptocurrencies?",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Portfolio Strategy",
    prompt: "Suggest a balanced crypto portfolio for moderate risk tolerance",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Market Trends",
    prompt: "What are the current market trends and which coins show strong momentum?",
  },
  {
    icon: <PieChart className="w-5 h-5" />,
    title: "Risk Management",
    prompt: "How should I manage risk when trading volatile altcoins?",
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

interface TradingAssistantRedesignedProps {
  coinId?: string;
  coinSymbol?: string;
  isEmbedded?: boolean;
  forceMobile?: boolean;
}

function TradingAssistantRedesigned({ 
  coinId, 
  coinSymbol, 
  isEmbedded = false,
  forceMobile = false 
}: TradingAssistantRedesignedProps) {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
          const loadedMessages = data.messages.map((msg: any, idx: number) => ({
            id: msg.id || msg._id || `${msg.role}-${sid}-${idx}`,
            role: msg.role,
            content: msg.content,
            feedback: msg.feedback,
          }));
          setMessages(loadedMessages);
          setSessionId(sid);
        }
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  };

  const deleteChatSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const res = await fetch(`/api/chat-history?sessionId=${sid}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChatHistory(prev => prev.filter(chat => chat.sessionId !== sid));
        if (sid === sessionId) {
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
    setMessages([]);
    setInputValue('');
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

      if (session?.user) {
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

  const showWelcome = messages.length === 0;

  return (
    <div className={cn(
      "flex bg-background overflow-hidden relative",
      isEmbedded ? "w-full h-full" : "fixed inset-0"
    )}>
      {/* Mobile Backdrop - show if mobile or forced mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "absolute inset-0 bg-black/60 backdrop-blur-sm z-40",
              !forceMobile && "lg:hidden"
            )}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute inset-y-0 left-0 z-50 h-full bg-card border-r border-dashed border-border flex flex-col overflow-hidden shadow-2xl",
              !forceMobile && "lg:relative lg:shadow-none"
            )}
          >
             <div className="w-64 flex flex-col h-full">
              {/* Header with logo and close button */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-dashed border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center p-1">
              <Logo size="sm" className="w-full h-full text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold">BlokkLens</h1>
            </div>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(!forceMobile && "lg:hidden")}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-2.5 border-b border-dashed border-border">
          <Button
            onClick={startNewChat}
            className="w-full bg-primary/10 hover:bg-primary/20 text-foreground rounded-lg gap-2 justify-start text-sm font-medium h-9"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

              {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2" data-lenis-prevent>
          <div className="text-xs font-medium text-muted-foreground/60 mb-2">
            RECENT CHATS
          </div>
                
                {loadingHistory ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : chatHistory.length > 0 ? (
                  <div className="space-y-0.5">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.sessionId}
                        className={cn(
                          "group relative flex items-start gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors",
                          chat.sessionId === sessionId && "bg-muted"
                        )}
                        onClick={() => loadChatSession(chat.sessionId)}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{chat.title}</p>
                          <p className="text-xs text-muted-foreground/60">
                            {new Date(chat.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                    <p className="text-xs text-muted-foreground">No chats yet</p>
                  </div>
                )}
              </div>

              {/* User Section */}
        <div className="p-2.5 border-t border-dashed border-border mt-auto">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{session.user.name || session.user.email}</div>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline"
              size="sm" 
              className="w-full text-sm bg-muted/50 hover:bg-muted"
              onClick={() => window.location.href = '/auth/login'}
            >
              Login
            </Button>
          )}
        </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Sidebar - Icon Only - Desktop Only - Hide if forceMobile */}
      {!sidebarOpen && !forceMobile && (
        <div className="hidden lg:flex w-16 bg-card border-r border-dashed border-border flex-col items-center">
          {/* Logo - matches expanded state height */}
          <div className="h-14 flex items-center justify-center border-b border-dashed border-border w-full">
            <Logo size="sm" className="w-6 h-6 text-primary" />
          </div>

          {/* New Chat Icon - matches expanded padding */}
          <div className="py-2.5 border-b border-dashed border-border w-full flex justify-center">
            <button
              onClick={startNewChat}
              className="w-9 h-9 rounded-lg hover:bg-primary/10 text-primary flex items-center justify-center transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Spacer for chat history */}
          <div className="flex-1 w-full" />

          {/* User Icon at Bottom - matches expanded padding */}
          <div className="p-2.5 border-t border-dashed border-border w-full flex justify-center">
            {session?.user ? (
              <div className="w-7 h-7 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            ) : (
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="w-7 h-7 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
                title="Login"
              >
                <User className="w-3.5 h-3.5 text-primary" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-card border-b border-dashed border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn("text-muted-foreground hover:text-foreground", !forceMobile && "lg:hidden")}
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <span className="text-sm font-semibold">BlokkLens AI</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Login button - visible on mobile/desktop appropriately */}
            {!session?.user && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 h-8 font-medium shadow-lg shadow-primary/20"
                onClick={() => window.location.href = '/auth/login'}
              >
                Login
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
              onClick={() => window.open('https://github.com/wasiiff', '_blank')}
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
              onClick={() => window.open('https://x.com/wasif_bin_nasir', '_blank')}
              title="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto relative" data-lenis-prevent>
          <div className="max-w-4xl mx-auto px-6 py-8">
            {showWelcome ? (
              /* Welcome Screen */
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col items-center justify-center min-h-[calc(100vh-240px)]"
              >
                <motion.div variants={itemVariants} className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <Logo size="lg" className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    Trade Smarter with BlokkLens AI
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                    Your AI wingman for intelligent crypto trading insights
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="w-full max-w-3xl">
                  <form onSubmit={handleFormSubmit} className="relative">
                    <div className="bg-card rounded-2xl border-2 border-dashed border-border p-3 shadow-sm hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask me how to start a conversation..."
                          className="flex-1 bg-transparent placeholder:text-muted-foreground resize-none outline-none text-sm max-h-[100px]"
                          rows={1}
                        />
                        <button
                          type="submit"
                          disabled={!inputValue.trim() || isLoading}
                          className="p-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground transition-all shrink-0"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>

                {/* Suggested Actions */}
                <motion.div 
                  variants={containerVariants}
                  className="flex flex-wrap gap-2 mt-6 w-full max-w-3xl justify-center"
                >
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <motion.button
                      key={index}
                      variants={itemVariants}
                      onClick={() => handleSuggestedPrompt(prompt.prompt)}
                      className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-muted transition-all text-xs font-medium"
                    >
                      <div className="text-primary">
                        {prompt.icon}
                      </div>
                      <span>{prompt.title}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              /* Conversation View */
              <>
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
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center p-1.5">
                              <Logo size="sm" className="w-full h-full text-primary" />
                            </div>
                            <span className="text-sm font-medium">BlokkLens AI</span>
                          </div>
                          
                          <div className="group relative pl-11">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ChatMarkdown>{message.content}</ChatMarkdown>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => handleCopy(message.content, index)}
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8 rounded-lg", message.feedback === 'up' && "text-emerald-500")}
                                onClick={() => handleFeedback(message.id, 'up')}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8 rounded-lg", message.feedback === 'down' && "text-rose-500")}
                                onClick={() => handleFeedback(message.id, 'down')}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-medium">{session?.user?.name || 'You'}</span>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                          
                          <div className="bg-primary/5 border border-primary/20 rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%]">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center p-1.5 animate-pulse">
                        <Logo size="sm" className="w-full h-full text-primary" />
                      </div>
                      <span className="text-sm font-medium">BlokkLens AI</span>
                    </div>
                    <div className="pl-11 flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area - Only show when there are messages */}
        {!showWelcome && (
          <div className="p-4 bg-card border-t border-border">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleFormSubmit}>
                <div className="bg-muted/30 rounded-2xl border-2 border-dashed border-border p-3 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Paste your chat screen!"
                      className="flex-1 bg-transparent placeholder:text-muted-foreground resize-none outline-none text-sm max-h-[100px]"
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground transition-all shrink-0"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TradingAssistantRedesigned);
