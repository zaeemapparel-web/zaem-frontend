"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Bot, User, Mic, MicOff, Trash2, ShoppingBag,
} from "lucide-react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

const QUICK_REPLIES = [
  "What products do you sell?",
  "Shipping charges?",
  "Return policy?",
  "Track my order",
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history on mount
  useEffect(() => {
    const saved = localStorage.getItem("zaem_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setShowQuickReplies(false);
          return;
        }
      } catch (e) {
        console.error("Failed to load chat history");
      }
    }
    // Default welcome message
    setMessages([
      {
        role: "assistant",
        content:
          "Assalam-o-Alaikum! 👋 Main ZAEM AI Assistant hoon. Aapki kya madad kar sakta hoon?\n\n(Aap English, Urdu, ya Roman Urdu mein baat kar sakte hain)",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("zaem_chat_history", JSON.stringify(messages.slice(-20)));
    }
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Voice input setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported on this browser");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const clearChat = () => {
    if (confirm("Clear chat history?")) {
      const welcome = {
        role: "assistant" as const,
        content:
          "Chat cleared! 👋 Aapki kya madad kar sakta hoon?",
        timestamp: Date.now(),
      };
      setMessages([welcome]);
      localStorage.removeItem("zaem_chat_history");
      setShowQuickReplies(true);
    }
  };

  const handleSend = useCallback(async (messageText?: string) => {
    const userMessage = (messageText || input).trim();
    if (!userMessage || loading) return;

    setInput("");
    setShowQuickReplies(false);

    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage, timestamp: Date.now() },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.data.reply,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Sorry, main abhi jawab nahi de sakta. Thori der baad try karein ya WhatsApp par rabta karein: +92 319 3773788",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Network issue hai. Please WhatsApp par contact karein: +92 319 3773788",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content: string) => {
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-[90] w-14 h-14 bg-ink text-ivory rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-300"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gold rounded-full border-2 border-ivory animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[95] sm:hidden"
          />

          {/* Chat Panel */}
          <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[100] w-full h-full sm:w-[420px] sm:h-[640px] sm:max-h-[85vh] bg-ivory shadow-2xl flex flex-col sm:rounded-2xl overflow-hidden sm:border sm:border-ink/10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-ink text-ivory shrink-0 safe-top">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-ink" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-ink" />
                </div>
                <div>
                  <p className="font-display text-base leading-tight">ZAEM AI</p>
                  <p className="text-[10px] text-ivory/60 font-body uppercase tracking-widest">
                    Always Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-ivory/10 rounded-full transition-colors"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-ivory/10 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-bone/30 cart-drawer-scroll">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 animate-[fadeIn_0.3s_ease-out] ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-ink rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-ivory" strokeWidth={1.5} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-sm font-body leading-relaxed whitespace-pre-wrap break-words ${
                      msg.role === "user"
                        ? "bg-ink text-ivory rounded-2xl rounded-tr-sm"
                        : "bg-ivory text-ink rounded-2xl rounded-tl-sm border border-ink/10"
                    }`}
                  >
                    {formatMessage(msg.content)}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-ink" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Replies */}
              {showQuickReplies && messages.length === 1 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] text-ink/40 uppercase tracking-widest font-body pl-10">
                    Quick Questions
                  </p>
                  <div className="flex flex-wrap gap-2 pl-10">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="px-3 py-1.5 bg-ivory border border-ink/15 rounded-full text-xs font-body text-ink hover:bg-ink hover:text-ivory transition-all duration-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 bg-ink rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-ivory" strokeWidth={1.5} />
                  </div>
                  <div className="bg-ivory border border-ink/10 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-ink/40 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-ink/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-2 h-2 bg-ink/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-ink/10 px-3 py-3 bg-ivory shrink-0 safe-bottom">
              <div className="flex gap-2 items-end">
                <button
                  onClick={toggleVoice}
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-bone/50 text-ink/60 hover:text-ink"
                  }`}
                  aria-label="Voice input"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Mic className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 bg-bone/50 border border-ink/10 rounded-2xl px-4 py-2.5 text-sm font-body outline-none focus:border-ink resize-none max-h-24"
                  style={{ minHeight: "44px" }}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-11 h-11 bg-ink text-ivory rounded-full flex items-center justify-center hover:bg-gold transition-colors disabled:opacity-40 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-[9px] text-ink/40 font-body">
                  Powered by ZAEM AI
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="text-[9px] text-ink/60 hover:text-ink font-body flex items-center gap-1 transition-colors"
                >
                  <ShoppingBag className="w-2.5 h-2.5" />
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}