"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageCircle,
  Headphones,
  X,
  ShoppingBag,
  Phone,
  Mail,
  ChevronUp,
} from "lucide-react";

// ==================== TYPES ====================
interface Props {
  onOpenShopAI: () => void;
  onOpenSupportAI: () => void;
  hasUnreadAI?: boolean;
}

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  iconBgColor: string;
  iconColor: string;
  action: "shop" | "support" | "whatsapp" | "call" | "email";
  href?: string;
  badge?: boolean;
}

// ==================== CONSTANTS ====================
const WHATSAPP_URL =
  "https://wa.me/923193773788?text=Hi%20ZAEM!%20I%20have%20a%20question%20about%20your%20products.";
const PHONE_NUMBER = "tel:+923193773788";
const EMAIL_ADDRESS = "mailto:zaemapparel@gmail.com";

// ==================== MAIN COMPONENT ====================
export default function FloatingActions({
  onOpenShopAI,
  onOpenSupportAI,
  hasUnreadAI = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ==================== VISIBILITY AFTER DELAY ====================
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // ==================== CLOSE ON OUTSIDE CLICK ====================
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-floating-actions]")) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    // Delay to prevent immediate close on open click
    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ==================== HAPTIC FEEDBACK (Mobile) ====================
  const hapticFeedback = useCallback((pattern: number | number[] = 10) => {
    if (typeof window === "undefined") return;
    if (!("vibrate" in navigator)) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore
    }
  }, []);

  // ==================== HANDLE ACTION ====================
  const handleAction = useCallback(
    (action: ActionItem) => {
      hapticFeedback(8);
      setLastAction(action.id);
      setIsOpen(false);

      // Delay for animation
      setTimeout(() => {
        if (action.action === "shop") onOpenShopAI();
        if (action.action === "support") onOpenSupportAI();
      }, 200);
    },
    [onOpenShopAI, onOpenSupportAI, hapticFeedback]
  );

  // ==================== TOGGLE ====================
  const handleToggle = useCallback(() => {
    hapticFeedback(isOpen ? 5 : [10, 20, 10]);
    setIsOpen((prev) => !prev);
  }, [isOpen, hapticFeedback]);

  // ==================== ACTION ITEMS ====================
  const actionItems: ActionItem[] = [
    {
      id: "shop",
      label: "Shop Assistant",
      icon: <ShoppingBag className="w-5 h-5" strokeWidth={1.9} />,
      bgColor: "bg-white",
      textColor: "text-ink",
      iconBgColor: "bg-ink",
      iconColor: "text-white",
      action: "shop",
    },
    {
      id: "support",
      label: "Support",
      icon: <Headphones className="w-5 h-5" strokeWidth={1.9} />,
      bgColor: "bg-ink",
      textColor: "text-white",
      iconBgColor: "bg-white",
      iconColor: "text-ink",
      action: "support",
      badge: hasUnreadAI,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" strokeWidth={2.2} />,
      bgColor: "bg-[#25D366]",
      textColor: "text-white",
      iconBgColor: "bg-white",
      iconColor: "text-[#25D366]",
      action: "whatsapp",
      href: WHATSAPP_URL,
    },
    {
      id: "call",
      label: "Call Us",
      icon: <Phone className="w-5 h-5" strokeWidth={2} />,
      bgColor: "bg-[#0A84FF]",
      textColor: "text-white",
      iconBgColor: "bg-white",
      iconColor: "text-[#0A84FF]",
      action: "call",
      href: PHONE_NUMBER,
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail className="w-5 h-5" strokeWidth={2} />,
      bgColor: "bg-[#EA4335]",
      textColor: "text-white",
      iconBgColor: "bg-white",
      iconColor: "text-[#EA4335]",
      action: "email",
      href: EMAIL_ADDRESS,
    },
  ];

  return (
    <div
      ref={containerRef}
      data-floating-actions
      className={`fixed bottom-6 right-4 md:bottom-8 md:right-6 z-[95] flex flex-col items-end gap-3 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {/* ==================== EXPANDED ITEMS ==================== */}
      <div
        className={`flex flex-col items-end gap-2.5 transition-all duration-500 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {actionItems.map((item, index) => {
          const delay = isOpen ? `${index * 60}ms` : "0ms";
          const isHovered = hoveredItem === item.id;

          // Render as anchor if href exists
          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                target={item.action === "whatsapp" ? "_blank" : undefined}
                rel={item.action === "whatsapp" ? "noopener noreferrer" : undefined}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => hapticFeedback(8)}
                style={{ transitionDelay: delay }}
                className={`group flex items-center gap-3 pl-4 pr-3 py-2.5 ${item.bgColor} ${item.textColor} rounded-full shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 border border-black/5 backdrop-blur-sm`}
                aria-label={item.label}
              >
                <span
                  className={`text-sm font-body tracking-wide whitespace-nowrap transition-all duration-300 ${
                    isHovered ? "opacity-100" : "opacity-90"
                  }`}
                >
                  {item.label}
                </span>
                <div
                  className={`w-10 h-10 ${item.iconBgColor} ${item.iconColor} rounded-full flex items-center justify-center relative transition-transform duration-300 ${
                    isHovered ? "scale-110" : "scale-100"
                  }`}
                >
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
              </a>
            );
          }

          // Render as button
          return (
            <button
              key={item.id}
              onClick={() => handleAction(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ transitionDelay: delay }}
              className={`group flex items-center gap-3 pl-4 pr-3 py-2.5 ${item.bgColor} ${item.textColor} rounded-full shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 border border-black/5 backdrop-blur-sm relative`}
              aria-label={item.label}
            >
              <span
                className={`text-sm font-body tracking-wide whitespace-nowrap transition-all duration-300 ${
                  isHovered ? "opacity-100" : "opacity-90"
                }`}
              >
                {item.label}
              </span>
              <div
                className={`w-10 h-10 ${item.iconBgColor} ${item.iconColor} rounded-full flex items-center justify-center relative transition-transform duration-300 ${
                  isHovered ? "scale-110" : "scale-100"
                }`}
              >
                {item.icon}
              </div>
              {item.badge && (
                <span className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== MAIN TOGGLE BUTTON ==================== */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`relative w-14 h-14 md:w-16 md:h-16 bg-ink text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? "rotate-90" : "rotate-0"
        }`}
        aria-label={isOpen ? "Close menu" : "Open actions"}
        aria-expanded={isOpen}
      >
        {/* Rotating X icon */}
        <X
          className={`absolute w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
            isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
          }`}
          strokeWidth={2.2}
        />

        {/* Rotating message icon */}
        <div
          className={`absolute w-full h-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
          }`}
        >
          <MessageCircle className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.9} />
        </div>

        {/* Ring pulse animation */}
        {!isOpen && visible && (
          <>
            <span
              className="absolute inset-0 rounded-full border-2 border-ink/20 animate-ping"
              style={{ animationDuration: "2.5s" }}
            />
            <span
              className="absolute inset-0 rounded-full border-2 border-ink/10 animate-ping"
              style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
            />
          </>
        )}

        {/* Unread badge */}
        {hasUnreadAI && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-white shadow-md">
            1
          </span>
        )}

        {/* Chevron indicator (when expanded) */}
        {isOpen && (
          <ChevronUp
            className="absolute -top-8 w-5 h-5 text-ink/40 animate-bounce"
            strokeWidth={2}
          />
        )}
      </button>

      {/* ==================== LABEL (Optional) ==================== */}
      {!isOpen && visible && (
        <div className="hidden md:block absolute bottom-full mb-2 right-0 bg-ink/90 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Need help? Click here
        </div>
      )}
    </div>
  );
}