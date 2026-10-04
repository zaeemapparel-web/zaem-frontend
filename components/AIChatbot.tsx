"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Bot, Mic, MicOff, Trash2,
  ImageIcon, Sparkles,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: number;
  status?: "sent" | "delivered" | "read";
  isAnimating?: boolean;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Assalam-o-Alaikum! 👋\n\nMain **ZAEM AI** hoon — aapki personal shopping assistant.\n\nMain aapki madad kar sakta hoon:\n• Product dhoondne mein\n• Order track karne mein\n• Size suggest karne mein\n\nKya jaanna chahenge?",
  timestamp: Date.now(),
  status: "read",
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat
  useEffect(() => {
    const saved = localStorage.getItem("zaem_chat_v5");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setHasUnread(false);
        }
      } catch (e) {}
    }
  }, []);

  // Save chat
  useEffect(() => {
    if (messages.length > 1) {
      const clean = messages.map(({ isAnimating, ...rest }) => rest);
      localStorage.setItem("zaem_chat_v5", JSON.stringify(clean.slice(-40)));
    }
  }, [messages]);

  // Smooth scroll
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
        });
      }, 30);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Lock body
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // Voice
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice not supported");
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
    if (confirm("Clear all messages?")) {
      setMessages([{ ...WELCOME_MESSAGE, timestamp: Date.now() }]);
      localStorage.removeItem("zaem_chat_v5");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image 5MB se choti honi chahiye");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSend = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    const imageToSend = pendingImage;
    if ((!content && !imageToSend) || loading) return;

    setInput("");
    setPendingImage(null);
    if (textareaRef.current) textareaRef.current.style.height = "36px";
    if (fileInputRef.current) fileInputRef.current.value = "";

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content || "📷 Photo",
      image: imageToSend || undefined,
      timestamp: Date.now(),
      status: "sent",
      isAnimating: true,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    // Auto mark animation done
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id ? { ...m, isAnimating: false } : m
        )
      );
    }, 400);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id ? { ...m, status: "delivered" } : m
        )
      );
    }, 250);

    try {
      const token = localStorage.getItem("zaem_token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: content || "Analyze this image and tell me if you have similar products.",
          image: imageToSend,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id ? { ...m, status: "read" } : m
        )
      );

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.success
          ? data.data.reply
          : "Sorry, masla ho gaya. WhatsApp: +92 319 3773788",
        timestamp: Date.now(),
        status: "read",
        isAnimating: true,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setHasUnread(true);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id ? { ...m, isAnimating: false } : m
          )
        );
      }, 400);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "Network issue. WhatsApp: +92 319 3773788",
        timestamp: Date.now(),
        status: "read",
        isAnimating: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === errorMsg.id ? { ...m, isAnimating: false } : m
          )
        );
      }, 400);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, pendingImage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "36px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const pathRegex = /(\/[a-z]+\/[a-z0-9-]+)/gi;

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      const urlParts = part.split(urlRegex);
      return urlParts.map((p, j) => {
        if (p.match(urlRegex)) {
          return (
            <a
              key={`${i}-${j}`}
              href={p}
              target="_blank"
              rel="noopener noreferrer"
              className="underline opacity-90 hover:opacity-100"
            >
              {p}
            </a>
          );
        }

        const pathParts = p.split(pathRegex);
        return pathParts.map((pp, k) => {
          if (
            pp.match(pathRegex) &&
            (pp.startsWith("/product/") || pp.startsWith("/shop"))
          ) {
            return (
              <Link
                key={`${i}-${j}-${k}`}
                href={pp}
                onClick={() => setIsOpen(false)}
                className="underline text-gold hover:text-gold/80 font-medium"
              >
                {pp}
              </Link>
            );
          }
          return <span key={`${i}-${j}-${k}`}>{pp}</span>;
        });
      });
    });
  };

  const TickMark = ({ status }: { status?: string }) => {
    const isRead = status === "read";
    const isDelivered = status === "delivered" || isRead;

    return (
      <span
        className="relative inline-flex items-center ml-1 tick-anim"
        style={{ width: "14px", height: "10px" }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          className={`absolute left-0 transition-colors duration-300 ${
            isRead ? "text-gold" : "text-ivory/50"
          }`}
        >
          <path
            d="M1 6.5L4 9L10 2.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isDelivered && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            className={`absolute left-1 transition-colors duration-300 tick-slide ${
              isRead ? "text-gold" : "text-ivory/50"
            }`}
          >
            <path
              d="M1 6.5L4 9L10 2.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    );
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-5 z-[90] flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-ink text-ivory rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] active:scale-95 transition-all duration-300 group chat-fab-float"
          aria-label="Open AI Chat"
        >
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-gold to-[#B8935A] rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-ink" strokeWidth={1.8} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-ink chat-status-pulse" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full chat-notif-bounce" />
            )}
          </div>
          <span className="text-xs font-body tracking-wider uppercase">
            Chat with AI
          </span>
          <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-ink/50 z-[95] sm:hidden chat-overlay-fade"
          />

          <div className="fixed z-[100] bg-[#F5F0E8] flex flex-col shadow-2xl overflow-hidden inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[660px] sm:max-h-[88vh] sm:rounded-2xl sm:border sm:border-ink/10 chat-window-pop">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-3 bg-[#0A0A0A] text-ivory shrink-0 safe-top relative">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 -ml-1 hover:bg-ivory/10 rounded-full transition-all duration-200 active:scale-90 sm:hidden"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-gold to-[#B8935A] rounded-full flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-ink" strokeWidth={1.8} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0A0A] chat-status-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-display text-sm leading-tight truncate tracking-wide">
                      ZAEM AI
                    </p>
                    <Sparkles className="w-3 h-3 text-gold" />
                  </div>
                  <p className="text-[10px] text-gold/80 font-body tracking-widest uppercase">
                    Online • Shop Manager
                  </p>
                </div>
              </div>

              <button
                onClick={clearChat}
                className="p-2 hover:bg-ivory/10 rounded-full transition-all duration-200 active:scale-90 shrink-0"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1 chatbot-scroll chatbot-scroll-smooth"
              style={{
                backgroundColor: "#F5F0E8",
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(201,169,97,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(10,10,10,0.03) 0%, transparent 50%)",
              }}
            >
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                const showTail = i === 0 || messages[i - 1]?.role !== msg.role;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    } ${
                      msg.isAnimating
                        ? isUser
                          ? "msg-in-right"
                          : "msg-in-left"
                        : ""
                    }`}
                  >
                    <div
                      className={`relative max-w-[85%] shadow-sm transition-all duration-200 ${
                        isUser
                          ? "bg-[#0A0A0A] text-ivory"
                          : "bg-white text-ink"
                      } ${
                        showTail
                          ? isUser
                            ? "rounded-2xl rounded-br-sm"
                            : "rounded-2xl rounded-bl-sm"
                          : "rounded-2xl"
                      } bubble-hover`}
                    >
                      {msg.image && (
                        <div className="p-1 pb-0">
                          <img
                            src={msg.image}
                            alt="Upload"
                            className="rounded-xl max-w-full max-h-64 object-cover"
                          />
                        </div>
                      )}

                      <div className="px-3.5 py-2.5">
                        <p className="text-[14.5px] leading-[1.5] font-body whitespace-pre-wrap break-words">
                          {formatContent(msg.content)}
                        </p>

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 -mb-0.5 ${
                            isUser ? "text-ivory/60" : "text-ink/40"
                          }`}
                        >
                          <span className="text-[9.5px] font-body">
                            {formatTime(msg.timestamp)}
                          </span>
                          {isUser && <TickMark status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex justify-start msg-in-left">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4 typing-wave">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Image Preview */}
            {pendingImage && (
              <div className="px-2 pt-2 bg-[#F5F0E8] border-t border-ink/5 image-preview-pop">
                <div className="relative inline-block">
                  <img
                    src={pendingImage}
                    alt="Preview"
                    className="h-16 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink text-ivory rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors active:scale-90"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="bg-[#F5F0E8] px-2 py-2 shrink-0 safe-bottom border-t border-ink/5">
              <div className="flex items-end gap-1.5 bg-white rounded-2xl px-1.5 py-1.5 shadow-sm border border-gold/20 focus-within:border-gold/60 transition-all duration-300 input-focus-glow">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-ink/60 hover:text-gold hover:bg-gold/10 active:scale-90 transition-all duration-200"
                  aria-label="Attach image"
                >
                  <ImageIcon className="w-4.5 h-4.5" strokeWidth={1.8} />
                </button>

                <button
                  onClick={toggleVoice}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 ${
                    isListening
                      ? "bg-red-500 text-white voice-pulse"
                      : "text-ink/60 hover:text-gold hover:bg-gold/10"
                  }`}
                  aria-label="Voice"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" strokeWidth={1.8} />
                  ) : (
                    <Mic className="w-4 h-4" strokeWidth={1.8} />
                  )}
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message ZAEM AI..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 outline-none text-[15px] font-body py-2 resize-none max-h-28 leading-snug placeholder:text-ink/40 smooth-textarea"
                  style={{ minHeight: "36px", height: "36px" }}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !pendingImage) || loading}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    (input.trim() || pendingImage) && !loading
                      ? "bg-gradient-to-br from-gold to-[#B8935A] text-ink active:scale-90 shadow-md send-ready"
                      : "bg-bone/50 text-ink/30"
                  }`}
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <p className="text-[9px] text-ink/40 text-center mt-1.5 font-body tracking-wider">
                ZAEM AI <span className="text-gold">•</span> Powered by Groq
                <span className="text-gold"> •</span> Ultra Pro Max
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}