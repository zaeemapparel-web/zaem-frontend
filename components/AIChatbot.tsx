"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Bot, Mic, MicOff, Trash2, ImageIcon,
  ShoppingBag, Headphones, Plus, ExternalLink, RotateCcw,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AIMode = "shop" | "support";

interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category?: { name: string; slug: string };
  stock: number;
  sizes?: string[];
  colors?: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: number;
  status?: "sent" | "delivered" | "read";
  isAnimating?: boolean;
  products?: ProductCard[];
  mode?: AIMode;
}

interface Props {
  isOpen: boolean;
  mode: AIMode;
  onClose: () => void;
}

// ==================== WELCOME MESSAGES ====================
const WELCOME_SHOP: Message = {
  id: "welcome-shop",
  role: "assistant",
  content:
    "Hi! 👋 I'm your **Shop Assistant**.\n\nMain aapko products dhoondne, best sellers, aur new arrivals mein madad kar sakta hoon.\n\nKya dekhna chahenge?",
  timestamp: Date.now(),
  status: "read",
};

const WELCOME_SUPPORT: Message = {
  id: "welcome-support",
  role: "assistant",
  content:
    "Hi! 👋 I'm **ZAEM Support**.\n\nMain aapki madad kar sakta hoon:\n• Order tracking\n• Shipping info\n• Returns & refunds\n• Payment queries\n\nKya jaanna chahenge?",
  timestamp: Date.now(),
  status: "read",
};

// ==================== QUICK PROMPTS ====================
const QUICK_PROMPTS_SHOP = [
  { label: "Best Sellers", query: "Show me your best sellers" },
  { label: "New Arrivals", query: "What's new?" },
  { label: "Sale Items", query: "Show me items on sale" },
  { label: "Bags", query: "Show me bags" },
  { label: "Perfumes", query: "Show me perfumes" },
];

const QUICK_PROMPTS_SUPPORT = [
  { label: "Track Order", query: "Where is my order?" },
  { label: "Shipping", query: "What are your shipping charges?" },
  { label: "Returns", query: "What is your return policy?" },
  { label: "Payments", query: "What payment methods do you accept?" },
  { label: "Contact", query: "How can I contact you?" },
];

// ==================== MAIN COMPONENT ====================
export default function AIChatbot({ isOpen, mode, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // ==================== LOAD CHAT HISTORY ====================
  useEffect(() => {
    if (!isOpen) return;
    const key = `zaem_chat_${mode}_v1`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setShowQuickPrompts(false);
          return;
        }
      } catch (e) {
        console.error("Failed to load chat history");
      }
    }
    setMessages([
      mode === "shop"
        ? { ...WELCOME_SHOP, timestamp: Date.now() }
        : { ...WELCOME_SUPPORT, timestamp: Date.now() },
    ]);
  }, [isOpen, mode]);

  // ==================== SAVE CHAT ====================
  useEffect(() => {
    if (messages.length > 1) {
      const clean = messages.map(({ isAnimating, ...rest }) => rest);
      localStorage.setItem(
        `zaem_chat_${mode}_v1`,
        JSON.stringify(clean.slice(-40))
      );
    }
  }, [messages, mode]);

  // ==================== MOBILE + KEYBOARD DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (!window.visualViewport) {
      return () => window.removeEventListener("resize", checkMobile);
    }

    const vv = window.visualViewport;

    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = vv.height;
      const keyboard = Math.max(0, windowHeight - viewportHeight);
      setKeyboardHeight(keyboard > 150 ? keyboard : 0);
    };

    vv.addEventListener("resize", handleResize);
    return () => {
      vv.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // ==================== SCROLL ====================
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
        });
      }, 50);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // ==================== BODY LOCK ====================
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen, isMobile]);

  // ==================== VOICE INPUT ====================
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

  // ==================== CLEAR CHAT ====================
  const clearChat = () => {
    if (confirm("Clear all messages?")) {
      setMessages([
        mode === "shop"
          ? { ...WELCOME_SHOP, timestamp: Date.now() }
          : { ...WELCOME_SUPPORT, timestamp: Date.now() },
      ]);
      localStorage.removeItem(`zaem_chat_${mode}_v1`);
      setShowQuickPrompts(true);
    }
  };

  // ==================== IMAGE UPLOAD ====================
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size 5MB se choti honi chahiye");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Sirf image files allowed hain");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ==================== ADD TO CART ====================
  const addToCart = async (productId: string, productName: string) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setAddedMessage("Please login to add to cart");
      setTimeout(() => setAddedMessage(null), 3000);
      return;
    }

    setAddingToCart(productId);

    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (data.success) {
        // Refresh cart store
        const cartRes = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = await cartRes.json();

        if (cartData.success) {
          window.dispatchEvent(
            new CustomEvent("cart-updated", {
              detail: {
                items: cartData.data.cart.items,
                itemCount: cartData.data.cart.itemCount,
                subtotal: cartData.data.cart.subtotal,
              },
            })
          );
        }

        setAddedMessage(`✓ ${productName} added to cart`);
        setTimeout(() => setAddedMessage(null), 3000);

        // Add confirmation message in chat
        const confirmMsg: Message = {
          id: `sys-${Date.now()}`,
          role: "assistant",
          content: `✅ **${productName}** added to your cart!\n\nKya aur kuch dekhna chahenge?`,
          timestamp: Date.now(),
          status: "read",
          isAnimating: true,
        };
        setMessages((prev) => [...prev, confirmMsg]);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === confirmMsg.id ? { ...m, isAnimating: false } : m
            )
          );
        }, 400);
      } else {
        setAddedMessage(data.message || "Failed to add to cart");
        setTimeout(() => setAddedMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
      setAddedMessage("Network error. Please try again.");
      setTimeout(() => setAddedMessage(null), 3000);
    } finally {
      setAddingToCart(null);
    }
  };

  // ==================== SEND MESSAGE ====================
  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text || input).trim();
      const imageToSend = pendingImage;

      if ((!content && !imageToSend) || loading) return;

      setInput("");
      setPendingImage(null);
      setShowQuickPrompts(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = "36px";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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

      // Mark animation complete
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, isAnimating: false } : m
          )
        );
      }, 400);

      // Mark delivered
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
            message: content || "Analyze this image",
            image: imageToSend,
            mode,
            history: messages.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();

        // Mark as read
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
            : "Sorry, kuch masla ho gaya. Please WhatsApp: +92 319 3773788",
          timestamp: Date.now(),
          status: "read",
          isAnimating: true,
          products: data.data?.products || [],
          mode,
        };

        setMessages((prev) => [...prev, aiMsg]);

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
          content:
            "Network issue. Please try again ya WhatsApp: +92 319 3773788",
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
    },
    [input, loading, messages, pendingImage, mode]
  );

  // ==================== KEYBOARD HANDLERS ====================
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Enter" && e.shiftKey && !isMobile) {
      // Allow new line with shift+enter
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "36px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleFocus = () => {
    setTimeout(() => scrollToBottom(), 300);
  };

  // ==================== FORMATTERS ====================
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
                onClick={onClose}
                className="underline opacity-90 hover:opacity-100 font-medium"
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

  // ==================== TICK MARK ====================
  const TickMark = ({ status }: { status?: string }) => {
    const isRead = status === "read";
    const isDelivered = status === "delivered" || isRead;

    return (
      <span
        className="relative inline-flex items-center ml-1"
        style={{ width: "14px", height: "10px" }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          className={`absolute left-0 transition-colors duration-300 ${
            isRead ? "text-white" : "text-white/40"
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
            className={`absolute left-1 transition-colors duration-300 ${
              isRead ? "text-white" : "text-white/40"
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

  // ==================== DYNAMIC HEIGHT ====================
  const dynamicHeight = isMobile
    ? keyboardHeight > 0
      ? `calc(100dvh - ${keyboardHeight}px)`
      : "100dvh"
    : "auto";

  const HeaderIcon = mode === "shop" ? ShoppingBag : Headphones;
  const headerTitle = mode === "shop" ? "Shop Assistant" : "Support";
  const quickPrompts =
    mode === "shop" ? QUICK_PROMPTS_SHOP : QUICK_PROMPTS_SUPPORT;

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 z-[110] sm:hidden animate-[overlayFade_0.25s_ease-out]"
      />

      {/* Chat Window */}
      <div
        className="fixed z-[115] bg-white flex flex-col shadow-2xl overflow-hidden animate-[windowPop_0.32s_cubic-bezier(0.34,1.56,0.64,1)]"
        style={
          isMobile
            ? {
                top: 0,
                left: 0,
                right: 0,
                height: dynamicHeight,
                maxHeight: dynamicHeight,
                transition: "height 0.2s ease-out",
                willChange: "height",
              }
            : {
                bottom: "24px",
                right: "24px",
                width: "420px",
                height: "660px",
                maxHeight: "88vh",
                borderRadius: "16px",
                border: "1px solid rgba(10,10,10,0.1)",
              }
        }
      >
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center gap-3 px-3 py-3 bg-ink text-white shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 hover:bg-white/10 rounded-full transition-all active:scale-90"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-white text-ink rounded-full flex items-center justify-center">
                <HeaderIcon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-ink" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold leading-tight truncate">
                {headerTitle}
              </p>
              <p className="text-[10px] text-white/60 font-body tracking-wide">
                Online
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* ==================== MESSAGES ==================== */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1 bg-[#F5F5F5]"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const showTail = i === 0 || messages[i - 1]?.role !== msg.role;

            return (
              <div key={msg.id}>
                <div
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  } ${
                    msg.isAnimating
                      ? isUser
                        ? "animate-[msgInRight_0.32s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                        : "animate-[msgInLeft_0.32s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                      : ""
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] shadow-sm transition-all duration-200 ${
                      isUser ? "bg-ink text-white" : "bg-white text-ink"
                    } ${
                      showTail
                        ? isUser
                          ? "rounded-2xl rounded-br-sm"
                          : "rounded-2xl rounded-bl-sm"
                        : "rounded-2xl"
                    }`}
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
                          isUser ? "text-white/60" : "text-ink/40"
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

                {/* Product cards */}
                {!isUser && msg.products && msg.products.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 ml-1">
                    {msg.products.map((p) => {
                      const hasDiscount =
                        p.comparePrice && p.comparePrice > p.price;

                      return (
                        <div
                          key={p.id}
                          className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-sm max-w-[90%] animate-[msgInLeft_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                        >
                          <div className="flex gap-3 p-3">
                            <Link
                              href={`/product/${p.slug}`}
                              onClick={onClose}
                              className="w-16 h-20 bg-bone shrink-0 rounded-lg overflow-hidden"
                            >
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-[10px] text-ink/30">
                                    Z
                                  </span>
                                </div>
                              )}
                            </Link>

                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/product/${p.slug}`}
                                onClick={onClose}
                                className="font-body text-sm font-medium leading-tight line-clamp-2 hover:underline"
                              >
                                {p.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <p className="font-body text-sm font-semibold">
                                  Rs. {p.price.toLocaleString()}
                                </p>
                                {hasDiscount && (
                                  <p className="font-body text-[11px] text-ink/40 line-through">
                                    Rs. {p.comparePrice!.toLocaleString()}
                                  </p>
                                )}
                              </div>
                              {p.stock === 0 && (
                                <p className="text-[10px] text-red-500 font-body mt-0.5">
                                  Out of stock
                                </p>
                              )}
                              {p.stock > 0 && p.stock <= 5 && (
                                <p className="text-[10px] text-orange-500 font-body mt-0.5">
                                  Only {p.stock} left
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex border-t border-ink/5">
                            <button
                              onClick={() => addToCart(p.id, p.name)}
                              disabled={addingToCart === p.id || p.stock === 0}
                              className="flex-1 py-2.5 text-[12px] font-body font-medium flex items-center justify-center gap-1.5 hover:bg-ink/5 active:bg-ink/10 transition-colors disabled:opacity-40"
                            >
                              {addingToCart === p.id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                                  Add to Cart
                                </>
                              )}
                            </button>
                            <Link
                              href={`/product/${p.slug}`}
                              onClick={onClose}
                              className="flex-1 py-2.5 text-[12px] font-body font-medium flex items-center justify-center gap-1.5 border-l border-ink/5 hover:bg-ink/5 active:bg-ink/10 transition-colors"
                            >
                              <ExternalLink
                                className="w-3.5 h-3.5"
                                strokeWidth={2}
                              />
                              View
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Prompts */}
          {showQuickPrompts && messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2">
              {quickPrompts.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleSend(q.query)}
                  className="px-3 py-1.5 bg-white border border-ink/10 rounded-full text-[11px] font-body text-ink hover:bg-ink hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start animate-[msgInLeft_0.2s_ease-out]">
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span
                    className="w-1.5 h-1.5 bg-ink/40 rounded-full"
                    style={{
                      animation: "typingWave 1.4s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-ink/40 rounded-full"
                    style={{
                      animation:
                        "typingWave 1.4s ease-in-out 0.15s infinite",
                    }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-ink/40 rounded-full"
                    style={{
                      animation:
                        "typingWave 1.4s ease-in-out 0.3s infinite",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Toast Notification */}
        {addedMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-ink text-white px-4 py-2.5 rounded-full text-xs font-body shadow-2xl animate-[msgInLeft_0.3s_ease-out] z-10 max-w-[90%]">
            {addedMessage}
          </div>
        )}

        {/* Image Preview */}
        {pendingImage && (
          <div className="px-2 pt-2 bg-white border-t border-ink/5 animate-[imagePreviewPop_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]">
            <div className="relative inline-block">
              <img
                src={pendingImage}
                alt="Preview"
                className="h-16 rounded-lg object-cover"
              />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors active:scale-90"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* ==================== INPUT ==================== */}
        <div className="bg-white px-2 py-2 shrink-0 border-t border-ink/5">
          <div className="flex items-end gap-1.5 bg-[#F5F5F5] rounded-2xl px-1.5 py-1.5 border border-transparent focus-within:border-ink/20 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-ink/50 hover:text-ink hover:bg-ink/5 active:scale-90 transition-all"
              aria-label="Attach image"
              title="Send photo"
            >
              <ImageIcon className="w-4.5 h-4.5" strokeWidth={1.8} />
            </button>

            <button
              onClick={toggleVoice}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-ink/50 hover:text-ink hover:bg-ink/5"
              }`}
              aria-label="Voice input"
              title="Voice input"
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
              onFocus={handleFocus}
              placeholder={`Message ${headerTitle}...`}
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none text-[15px] font-body py-2 resize-none max-h-28 leading-snug placeholder:text-ink/40"
              style={{ minHeight: "36px", height: "36px" }}
            />

            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !pendingImage) || loading}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                (input.trim() || pendingImage) && !loading
                  ? "bg-ink text-white active:scale-90"
                  : "bg-ink/10 text-ink/30"
              }`}
              aria-label="Send"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <p className="text-[9px] text-ink/40 text-center mt-1.5 font-body tracking-wider">
            ZAEM AI
          </p>
        </div>
      </div>
    </>
  );
}