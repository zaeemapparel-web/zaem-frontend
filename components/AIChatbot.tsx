"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Bot, Mic, MicOff, Trash2, Check, CheckCheck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: "sent" | "delivered" | "read";
}

const QUICK_REPLIES = [
  "What products?",
  "Shipping?",
  "Returns?",
  "Track order",
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Assalam-o-Alaikum! 👋\n\nMain ZAEM AI hoon — aapki shopping mein madad ke liye.\n\nKya poochna chahenge?",
  timestamp: Date.now(),
  status: "read",
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history
  useEffect(() => {
    const saved = localStorage.getItem("zaem_chat_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setShowQuickReplies(false);
        }
      } catch (e) {
        console.error("Chat load error");
      }
    }
  }, []);

  // Save chat
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("zaem_chat_v2", JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

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

  // Keyboard detection (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        setKeyboardOpen(isKeyboard);
        if (isKeyboard) scrollToBottom(false);
      }
    };
    
    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }
  }, [scrollToBottom]);

  // Voice input
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
      textareaRef.current?.focus();
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice not supported on this browser");
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
      localStorage.removeItem("zaem_chat_v2");
      setShowQuickReplies(true);
    }
  };

  const handleSend = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");
    setShowQuickReplies(false);
    if (textareaRef.current) textareaRef.current.style.height = "44px";

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
      status: "sent",
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    // Update to delivered
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "delivered" } : m))
      );
    }, 300);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      // Update user message to read
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "read" } : m))
      );

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.success
          ? data.data.reply
          : "Sorry, kuch masla ho gaya. Thori der baad try karein ya WhatsApp: +92 319 3773788",
        timestamp: Date.now(),
        status: "read",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content:
            "Network issue. Please try again or WhatsApp: +92 319 3773788",
          timestamp: Date.now(),
          status: "read",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = "44px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const StatusIcon = ({ status }: { status?: string }) => {
    if (status === "read") {
      return <CheckCheck className="w-3 h-3 text-blue-400" strokeWidth={2} />;
    }
    if (status === "delivered") {
      return <CheckCheck className="w-3 h-3 text-ivory/60" strokeWidth={2} />;
    }
    return <Check className="w-3 h-3 text-ivory/60" strokeWidth={2} />;
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-5 z-[90] flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-ink text-ivory rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.35)] active:scale-95 transition-all duration-300"
          aria-label="Open AI Chat"
        >
          <div className="relative">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-ink" strokeWidth={1.5} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-ink" />
          </div>
          <span className="text-xs font-body tracking-wider uppercase">Chat</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-ink/50 z-[95] sm:hidden"
          />

          {/* Chat Panel */}
          <div
            className="fixed z-[100] bg-[#EFEAE2] flex flex-col shadow-2xl overflow-hidden
              inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[640px] sm:max-h-[85vh] sm:rounded-2xl sm:border sm:border-ink/10"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#0A0A0A] text-ivory shrink-0 safe-top">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 -ml-1 hover:bg-ivory/10 rounded-full transition-colors sm:hidden"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-ink" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm leading-tight truncate">ZAEM AI</p>
                  <p className="text-[10px] text-ivory/60 font-body truncate">
                    online
                  </p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="p-2 hover:bg-ivory/10 rounded-full transition-colors shrink-0"
                aria-label="Clear"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1.5 chatbot-scroll"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230a0a0a' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            >
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                const showTail =
                  i === 0 || messages[i - 1]?.role !== msg.role;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} animate-[msgIn_0.2s_ease-out]`}
                  >
                    <div
                      className={`relative max-w-[82%] px-2.5 py-1.5 shadow-sm ${
                        isUser
                          ? "bg-[#D9FDD3] text-ink rounded-lg"
                          : "bg-white text-ink rounded-lg"
                      } ${
                        isUser && showTail ? "rounded-tr-none" : ""
                      } ${
                        !isUser && showTail ? "rounded-tl-none" : ""
                      }`}
                    >
                      {/* Message tail */}
                      {showTail && (
                        <div
                          className={`absolute top-0 w-2 h-3 ${
                            isUser
                              ? "right-[-6px] bg-[#D9FDD3]"
                              : "left-[-6px] bg-white"
                          }`}
                          style={{
                            clipPath: isUser
                              ? "polygon(0 0, 100% 0, 0 100%)"
                              : "polygon(0 0, 100% 0, 100% 100%)",
                          }}
                        />
                      )}

                      <p className="text-[14.5px] leading-[1.35] font-body whitespace-pre-wrap break-words pr-12">
                        {formatContent(msg.content)}
                      </p>

                      {/* Time + status (bottom-right) */}
                      <div
                        className={`absolute bottom-1 right-2 flex items-center gap-1 ${
                          isUser ? "text-ink/50" : "text-ink/40"
                        }`}
                      >
                        <span className="text-[10px] font-body">
                          {formatTime(msg.timestamp)}
                        </span>
                        {isUser && <StatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quick Replies */}
              {showQuickReplies && messages.length <= 1 && (
                <div className="pt-3 pb-1 space-y-2 animate-[msgIn_0.3s_ease-out]">
                  <p className="text-[10px] text-ink/50 uppercase tracking-widest font-body text-center">
                    Quick replies
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="px-3 py-1.5 bg-white border border-ink/10 rounded-full text-xs font-body text-ink/80 hover:bg-ink hover:text-ivory active:scale-95 transition-all duration-200 shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start animate-[msgIn_0.2s_ease-out]">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-[typing_1.2s_infinite]" />
                      <span
                        className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-[typing_1.2s_infinite]"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-[typing_1.2s_infinite]"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Bar */}
            <div className="bg-[#EFEAE2] px-2 py-2 shrink-0 safe-bottom border-t border-ink/5">
              <div className="flex items-end gap-1.5 bg-white rounded-2xl px-2 py-1.5 shadow-sm">
                <button
                  onClick={toggleVoice}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-ink/50 hover:text-ink hover:bg-bone/50"
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
                  onFocus={() => scrollToBottom()}
                  placeholder="Message"
                  rows={1}
                  className="flex-1 bg-transparent border-0 outline-none text-[15px] font-body py-2 resize-none max-h-28 leading-snug placeholder:text-ink/40"
                  style={{ minHeight: "36px", height: "36px" }}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                    input.trim() && !loading
                      ? "bg-[#0A0A0A] text-ivory active:scale-90"
                      : "bg-bone/50 text-ink/30"
                  }`}
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <p className="text-[9px] text-ink/40 text-center mt-1.5 font-body">
                ZAEM AI • Powered by Groq
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}