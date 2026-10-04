"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Assalam-o-Alaikum! 👋 Main ZAEM AI Assistant hoon. Aapki kya madad kar sakta hoon?\n\n(Aap English, Urdu, ya Roman Urdu mein baat kar sakte hain)",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Lock body scroll when open
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6), // Last 3 exchanges
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.data.reply },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Sorry, main abhi jawab nahi de sakta. Thori der baad try karein ya WhatsApp par rabta karein: +92 319 3773788",
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
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-[90] w-14 h-14 bg-ink text-ivory rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Overlay for mobile */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[95] sm:hidden"
          />

          {/* Chat Panel */}
          <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[100] w-full sm:w-[400px] h-[85vh] sm:h-[600px] bg-ivory shadow-2xl flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden border border-ink/10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-ink text-ivory shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-ink" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-display text-base">ZAEM AI</p>
                  <p className="text-xs text-ivory/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-ivory/10 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-bone/30">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-ink rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-ivory" strokeWidth={1.5} />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 text-sm font-body leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-ink text-ivory rounded-2xl rounded-tr-sm"
                        : "bg-ivory text-ink rounded-2xl rounded-tl-sm border border-ink/10"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-ink" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              ))}

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
            <div className="border-t border-ink/10 px-4 py-3 bg-ivory shrink-0">
              <div className="flex gap-2 items-end">
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
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-11 h-11 bg-ink text-ivory rounded-full flex items-center justify-center hover:bg-gold transition-colors disabled:opacity-40 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-[10px] text-ink/40 text-center mt-2 font-body">
                Powered by Google Gemini AI
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}