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
  Phone,
  Mail,
  Sparkles,
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
}

interface Position {
  x: number;
  y: number;
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
const POSITION_KEY = "zaem_shop_assistant_pos";
const DRAG_THRESHOLD = 8;
const SNAP_MARGIN = 16;
const DEFAULT_BOTTOM_OFFSET = 100;

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

  // Shop Assistant drag state
  const [shopPos, setShopPos] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const dragMovedRef = useRef(false);

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

  // ==================== LOAD SAVED POSITION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(POSITION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed?.x === "number" &&
          typeof parsed?.y === "number" &&
          parsed.x >= 0 &&
          parsed.y >= 0 &&
          parsed.x <= window.innerWidth &&
          parsed.y <= window.innerHeight
        ) {
          setShopPos(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // ==================== SAVE POSITION ====================
  const savePosition = useCallback((pos: Position) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
    } catch {
      // ignore
    }
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
      if (
        !target.closest("[data-floating-actions]") &&
        !target.closest("[data-shop-assistant]")
      ) {
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

  // ==================== HAPTIC FEEDBACK ====================
  const hapticFeedback = useCallback(
    (pattern: number | number[] = 10) => {
      if (typeof window === "undefined") return;
      if (!("vibrate" in navigator)) return;
      if (reducedMotion) return;
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    },
    [reducedMotion]
  );

  // ==================== SHOP ASSISTANT - DRAG HANDLERS ====================
  const handleShopDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!shopRef.current) return;
      const rect = shopRef.current.getBoundingClientRect();
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        posX: rect.left,
        posY: rect.top,
      };
      dragMovedRef.current = false;
      setIsDragging(true);
      hapticFeedback(5);
    },
    [hapticFeedback]
  );

  const handleShopDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragStartRef.current) return;

      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;

      if (!dragMovedRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        dragMovedRef.current = true;
        setHasDragged(true);
      }

      if (!dragMovedRef.current) return;

      const el = shopRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const newX = dragStartRef.current.posX + dx;
      const newY = dragStartRef.current.posY + dy;

      const maxX = window.innerWidth - rect.width - SNAP_MARGIN;
      const maxY = window.innerHeight - rect.height - SNAP_MARGIN;

      const clampedX = Math.max(SNAP_MARGIN, Math.min(newX, maxX));
      const clampedY = Math.max(SNAP_MARGIN, Math.min(newY, maxY));

      setShopPos({ x: clampedX, y: clampedY });
    },
    []
  );

  const handleShopDragEnd = useCallback(() => {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    setIsDragging(false);

    // If not dragged → treat as click (open AI)
    if (!dragMovedRef.current) {
      hapticFeedback(HAPTIC_LIGHT);
      onOpenShopAI();
      setHasDragged(false);
      return;
    }

    // Snap to nearest edge (left or right)
    setShopPos((prev) => {
      if (!prev || !shopRef.current) return prev;
      const rect = shopRef.current.getBoundingClientRect();
      const centerX = prev.x + rect.width / 2;
      const screenCenter = window.innerWidth / 2;
      const isLeftSide = centerX < screenCenter;

      const snappedX = isLeftSide
        ? SNAP_MARGIN
        : window.innerWidth - rect.width - SNAP_MARGIN;

      const newPos = { x: snappedX, y: prev.y };
      savePosition(newPos);
      hapticFeedback([5, 30, 5]);
      return newPos;
    });

    setTimeout(() => setHasDragged(false), 250);
  }, [onOpenShopAI, hapticFeedback, savePosition]);

  // ==================== SHOP ASSISTANT - MOUSE EVENTS ====================
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleShopDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleShopDragEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleShopDragMove, handleShopDragEnd]);

  // ==================== SHOP ASSISTANT - TOUCH EVENTS ====================
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      handleShopDragMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      handleShopDragEnd();
    };

    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleShopDragMove, handleShopDragEnd]);

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

  // ==================== ACTION ITEMS ====================
  const actionItems: ActionItem[] = useMemo(
    () => [
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

  // ==================== SHOP ASSISTANT STYLE ====================
  const shopStyle: React.CSSProperties = useMemo(() => {
    if (shopPos) {
      return {
        position: "fixed",
        left: `${shopPos.x}px`,
        top: `${shopPos.y}px`,
        touchAction: "none",
        transition: isDragging
          ? "none"
          : "left 0.5s cubic-bezier(0.34,1.56,0.64,1), top 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      };
    }

    return {
      position: "fixed",
      right: "16px",
      bottom: `${DEFAULT_BOTTOM_OFFSET}px`,
      touchAction: "none",
    };
  }, [shopPos, isDragging]);

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

      {/* ==================== SHOP ASSISTANT (only when menu is closed) ==================== */}
      {!isOpen && (
        <div
          ref={shopRef}
          data-shop-assistant
          style={shopStyle}
          className={`z-[97] select-none transition-opacity duration-700 ${
            visible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleShopDragStart(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handleShopDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onClick={(e) => {
              if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            aria-label="Open Shop Assistant (drag to move)"
            className={`group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] shadow-2xl border border-white/10 dark:border-black/10 backdrop-blur-md transition-all duration-300 ${
              isDragging
                ? "cursor-grabbing scale-105 shadow-2xl"
                : "cursor-grab hover:scale-105 active:scale-95"
            }`}
          >
            {/* Icon circle */}
            <div className="w-9 h-9 rounded-full bg-white dark:bg-[#1D1D1F] flex items-center justify-center shrink-0">
              <Sparkles
                className="w-4 h-4 text-[#1D1D1F] dark:text-white"
                strokeWidth={2}
              />
            </div>

            {/* Text */}
            <span className="text-[13px] font-body font-medium whitespace-nowrap pr-1">
              Shop Assistant
            </span>

            {/* Drag hint dots */}
            <div className="flex flex-col gap-0.5 pr-1 opacity-40 group-hover:opacity-70 transition-opacity">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-0.5 rounded-full bg-current" />
                <div className="w-0.5 h-0.5 rounded-full bg-current" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-0.5 rounded-full bg-current" />
                <div className="w-0.5 h-0.5 rounded-full bg-current" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-0.5 rounded-full bg-current" />
                <div className="w-0.5 h-0.5 rounded-full bg-current" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ==================== CONTAINER (MENU) ==================== */}
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
          {/* Shop Assistant as FIRST menu item when open */}
          {isOpen && (
            <button
              onClick={() => {
                hapticFeedback(HAPTIC_LIGHT);
                setIsOpen(false);
                setTimeout(() => onOpenShopAI(), 200);
              }}
              onMouseEnter={() => setHoveredItem("shop")}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ transitionDelay: "0ms" }}
              className="group flex items-center gap-3 pl-4 pr-3 py-2.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-full shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 border border-black/5 dark:border-white/10 backdrop-blur-sm"
              aria-label="Shop Assistant"
              role="menuitem"
            >
              <span
                className={`text-sm font-body tracking-wide whitespace-nowrap transition-all duration-300 ${
                  hoveredItem === "shop" ? "opacity-100" : "opacity-90"
                }`}
              >
                Shop Assistant
              </span>
              <div
                className={`w-10 h-10 bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white rounded-full flex items-center justify-center relative transition-transform duration-300 ${
                  hoveredItem === "shop" ? "scale-110" : "scale-100"
                }`}
              >
                <Sparkles className="w-5 h-5" strokeWidth={1.9} />
              </div>
            </button>
          )}

          {actionItems.map((item, index) => {
            const delay = isOpen ? `${(index + 1) * 60}ms` : "0ms";
            const isHovered = hoveredItem === item.id;

            // ============ LINK ITEM ============
            if (item.href) {
              return (
                <a
                  key={item.id}
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
          <X
            className={`absolute w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
              isOpen
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-75"
            }`}
            strokeWidth={2.2}
          />

          <div
            className={`absolute w-full h-full flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? "opacity-0 -rotate-90 scale-75"
                : "opacity-100 rotate-0 scale-100"
            }`}
          >
            <MessageCircle
              className="w-6 h-6 md:w-7 md:h-7"
              strokeWidth={1.9}
            />
          </div>

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

          {hasUnreadAI && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-white dark:border-[#1C1C1E] shadow-md">
              1
            </span>
          )}
        </button>
      </div>
    </>
  );
}