"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingBag } from "lucide-react";

interface Props {
  onClick: () => void;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "zaem_shop_btn_pos";
const BTN_SIZE = 56; // w-14 h-14
const EDGE_PADDING = 12;

export default function ShopAssistantButton({ onClick }: Props) {
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    pointerId: 0,
  });

  // ==================== MOBILE DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ==================== LOAD SAVED POSITION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate position is within viewport
        const maxX = window.innerWidth - BTN_SIZE - EDGE_PADDING;
        const maxY = window.innerHeight - BTN_SIZE - EDGE_PADDING;

        setPosition({
          x: Math.max(EDGE_PADDING, Math.min(parsed.x, maxX)),
          y: Math.max(EDGE_PADDING, Math.min(parsed.y, maxY)),
        });
      } catch (e) {
        // Invalid — use default
      }
    }
  }, []);

  // ==================== WINDOW RESIZE — Clamp Position ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const maxX = window.innerWidth - BTN_SIZE - EDGE_PADDING;
        const maxY = window.innerHeight - BTN_SIZE - EDGE_PADDING;
        return {
          x: Math.max(EDGE_PADDING, Math.min(prev.x, maxX)),
          y: Math.max(EDGE_PADDING, Math.min(prev.y, maxY)),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ==================== DRAG START ====================
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        pointerId: e.pointerId,
      };

      setIsDragging(true);
      setHasMoved(false);

      buttonRef.current.setPointerCapture(e.pointerId);
    },
    []
  );

  // ==================== DRAG MOVE ====================
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return;

      const dx = Math.abs(e.clientX - dragRef.current.startX);
      const dy = Math.abs(e.clientY - dragRef.current.startY);

      // Only consider it a drag if moved more than 5px
      if (dx > 5 || dy > 5) {
        setHasMoved(true);
      }

      const newX = e.clientX - dragRef.current.offsetX;
      const newY = e.clientY - dragRef.current.offsetY;

      // Clamp within viewport
      const maxX = window.innerWidth - BTN_SIZE - EDGE_PADDING;
      const maxY = window.innerHeight - BTN_SIZE - EDGE_PADDING;

      setPosition({
        x: Math.max(EDGE_PADDING, Math.min(newX, maxX)),
        y: Math.max(EDGE_PADDING, Math.min(newY, maxY)),
      });
    },
    [isDragging]
  );

  // ==================== DRAG END ====================
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return;

      setIsDragging(false);

      if (buttonRef.current) {
        try {
          buttonRef.current.releasePointerCapture(e.pointerId);
        } catch (err) {
          // ignore
        }
      }

      // Save position
      setPosition((prev) => {
        if (prev) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
        }
        return prev;
      });

      // If it was a click (not drag) → open Shop AI
      if (!hasMoved) {
        onClick();
      }
    },
    [isDragging, hasMoved, onClick]
  );

  // ==================== HANDLE CLICK (Fallback) ====================
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only fire if it wasn't a drag
      if (!hasMoved) {
        e.preventDefault();
        // onClick handled in pointerUp
      }
    },
    [hasMoved]
  );

  // ==================== POSITION STYLE ====================
  const style: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
      }
    : {
        right: isMobile ? "20px" : "24px",
        bottom: isMobile ? "120px" : "140px",
        touchAction: "none",
      };

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      style={style}
      className={`fixed z-[80] w-14 h-14 bg-white text-ink rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center border border-ink/5 transition-shadow duration-300 select-none ${
        isDragging
          ? "cursor-grabbing scale-110"
          : "cursor-grab active:scale-95"
      }`}
      aria-label="Shop Assistant"
    >
      {/* Icon */}
      <ShoppingBag
        className="w-6 h-6 pointer-events-none"
        strokeWidth={1.8}
      />

      {/* Notification dot */}
      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
    </button>
  );
}