"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  MessageCircle,
  Headphones,
  X,
  ShoppingBag,
  Phone,
  Mail,
} from "lucide-react";

// ==================== TYPES ====================
interface Props {
  onOpenShopAI: () => void;
  onOpenSupportAI: () => void;
  hasUnreadAI?: boolean;
}

type ActionType = "shop" | "support" | "whatsapp" | "call" | "email";

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  iconBgColor: string;
  iconColor: string;
  action: ActionType;
  href?: string;
  badge?: boolean;
  shortcut?: string;
}

// ==================== CONSTANTS ====================
const WHATSAPP_URL =
  "https://wa.me/923193773788?text=Hi%20ZAEM!%20I%20have%20a%20question%20about%20your%20products.";
const PHONE_NUMBER = "tel:+923193773788";
const EMAIL_ADDRESS = "mailto:zaemapparel@gmail.com";

const HAPTIC_LIGHT = 8;
const HAPTIC_TOGGLE = [12, 20, 12];
const OPEN_DELAY = 1200;
const OUTSIDE_CLICK_DELAY = 100;

// ==================== MAIN COMPONENT ====================
export default function FloatingActions({
  onOpenShopAI,
  onOpenSupportAI,
  hasUnreadAI = false,
}: Props) {
  // ==================== STATE ====================
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  // ==================== DETECT MOBILE + REDUCED MOTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handleMotionChange = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mq.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mq.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // ==================== VISIBILITY AFTER DELAY ====================
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), OPEN_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // ==================== LOCK BODY SCROLL (mobile) ====================
  useEffect(() => {
    if (!isMobile) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  // ==================== OUTSIDE CLICK + ESC ====================
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-floating-actions]")) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }, OUTSIDE_CLICK_DELAY);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K → Shop AI
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        hapticFeedback(HAPTIC_LIGHT);
        setIsOpen(false);
        onOpenShopAI();
      }
      // Ctrl/Cmd + / → Support AI
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        hapticFeedback(HAPTIC_LIGHT);
        setIsOpen(false);
        onOpenSupportAI();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [onOpenShopAI, onOpenSupportAI]);

  // ==================== HAPTIC FEEDBACK ====================
  const hapticFeedback = useCallback((pattern: number | number[] = 10) => {
    if (typeof window === "undefined") return;
    if (!("vibrate" in navigator)) return;
    if (reducedMotion) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore
    }
  }, [reducedMotion]);

  // ==================== HANDLE ACTION ====================
  const handleAction = useCallback(
    (action: ActionItem) => {
      hapticFeedback(HAPTIC_LIGHT);
      setIsOpen(false);

      setTimeout(() => {
        if (action.action === "shop") onOpenShopAI();
        if (action.action === "support") onOpenSupportAI();
      }, 200);
    },
    [onOpenShopAI, onOpenSupportAI, hapticFeedback]
  );

  // ==================== TOGGLE ====================
  const handleToggle = useCallback(() => {
    hapticFeedback(isOpen ? 5 : HAPTIC_TOGGLE);
    setIsOpen((prev) => !prev);
  }, [isOpen, hapticFeedback]);

  // ==================== FOCUS MANAGEMENT ====================
  useEffect(() => {
    if (isOpen && firstItemRef.current) {
      setTimeout(() => firstItemRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ==================== ACTION ITEMS ====================
  const actionItems: ActionItem[] = useMemo(
    () => [
      {
        id: "shop",
        label: "Shop Assistant",
        icon: <ShoppingBag className="w-5 h-5" strokeWidth={1.9} />,
        bgColor: "bg-white dark:bg-[#1C1C1E]",
        textColor: "text-[#1D1D1F] dark:text-white",
        iconBgColor: "bg-[#1D1D1F] dark:bg-white",
        iconColor: "text-white dark:text-[#1D1D1F]",
        action: "shop",
        shortcut: "⌘K",
      },
      {
        id: "support",
        label: "Support",
        icon: <Headphones className="w-5 h-5" strokeWidth={1.9} />,
        bgColor: "bg-[#1D1D1F] dark:bg-white",
        textColor: "text-white dark:text-[#1D1D1F]",
        iconBgColor: "bg-white dark:bg-[#1C1C1E]",
        iconColor: "text-[#1D1D1F] dark:text-white",
        action: "support",
        badge: hasUnreadAI,
        shortcut: "⌘/",
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
    ],
    [hasUnreadAI]
  );

  // ==================== RENDER ====================
  return (
    <>
      {/* ==================== MOBILE BACKDROP ==================== */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-[94] bg-black/30 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ==================== CONTAINER ==================== */}
      <div
        ref={containerRef}
        data-floating-actions
        className={`fixed bottom-5 right-4 md:bottom-8 md:right-6 z-[95] flex flex-col items-end gap-3 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
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
          role="menu"
          aria-label="Contact actions"
        >
          {actionItems.map((item, index) => {
            const delay = isOpen ? `${index * 60}ms` : "0ms";
            const isHovered = hoveredItem === item.id;
            const isFirst = index === 0;

            // ============ LINK ITEM ============
            if (item.href) {
              return (
                <a
                  key={item.id}
                  ref={isFirst ? (firstItemRef as any) : undefined}
                  href={item.href}
                  target={item.action === "whatsapp" ? "_blank" : undefined}
                  rel={
                    item.action === "whatsapp"
                      ? "noopener noreferrer"
                      : undefined
                  }
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => hapticFeedback(HAPTIC_LIGHT)}
                  style={{ transitionDelay: delay }}
                  className={`group flex items-center gap-3 pl-4 pr-3 py-2.5 ${item.bgColor} ${item.textColor} rounded-full shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 border border-black/5 dark:border-white/10 backdrop-blur-sm`}
                  aria-label={item.label}
                  role="menuitem"
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
                </a>
              );
            }

            // ============ BUTTON ITEM ============
            return (
              <button
                key={item.id}
                ref={isFirst ? (firstItemRef as any) : undefined}
                onClick={() => handleAction(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ transitionDelay: delay }}
                className={`group flex items-center gap-3 pl-4 pr-3 py-2.5 ${item.bgColor} ${item.textColor} rounded-full shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 border border-black/5 dark:border-white/10 backdrop-blur-sm relative`}
                aria-label={item.label}
                role="menuitem"
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
                  <span className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1C1C1E] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* ==================== MAIN TOGGLE BUTTON ==================== */}
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={`relative w-14 h-14 md:w-16 md:h-16 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
          aria-label={isOpen ? "Close actions menu" : "Open contact menu"}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {/* Rotating X icon */}
          <X
            className={`absolute w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
              isOpen
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-75"
            }`}
            strokeWidth={2.2}
          />

          {/* Rotating message icon */}
          <div
            className={`absolute w-full h-full flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? "opacity-0 -rotate-90 scale-75"
                : "opacity-100 rotate-0 scale-100"
            }`}
          >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.9} />
          </div>

          {/* Double-ring pulse animation (only when closed) */}
          {!isOpen && visible && !reducedMotion && (
            <>
              <span
                className="absolute inset-0 rounded-full border-2 border-[#1D1D1F]/20 dark:border-white/20 animate-ping"
                style={{ animationDuration: "2.5s" }}
              />
              <span
                className="absolute inset-0 rounded-full border-2 border-[#1D1D1F]/10 dark:border-white/10 animate-ping"
                style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
              />
            </>
          )}

          {/* Unread badge */}
          {hasUnreadAI && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-white dark:border-[#1C1C1E] shadow-md">
              1
            </span>
          )}
        </button>

        {/* ==================== TOOLTIP (Desktop) ==================== */}
        {!isOpen && visible && (
          <div className="hidden md:block absolute bottom-full mb-3 right-0 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-xs px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
            Need help?
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1D1D1F] dark:border-t-white" />
          </div>
        )}
      </div>
    </>
  );
}