"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, MessageCircle, Headphones, X } from "lucide-react";

interface Props {
  onOpenShopAI: () => void;
  onOpenSupportAI: () => void;
  hasUnreadAI?: boolean;
}

export default function FloatingActions({
  onOpenShopAI,
  onOpenSupportAI,
  hasUnreadAI = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-floating-actions]")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isOpen]);

  return (
    <div
      data-floating-actions
      className={`fixed bottom-6 right-4 md:bottom-8 md:right-6 z-[95] flex flex-col items-end gap-3 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          onClick={() => {
            setIsOpen(false);
            onOpenShopAI();
          }}
          className="group flex items-center gap-3 pl-4 pr-3 py-2.5 bg-white text-ink rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 border border-ink/5"
          style={{ transitionDelay: isOpen ? "50ms" : "0ms" }}
        >
          <span className="text-sm font-body tracking-wide">Shop Assistant</span>
          <div className="w-10 h-10 bg-ink text-white rounded-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
          </div>
        </button>

        <button
          onClick={() => {
            setIsOpen(false);
            onOpenSupportAI();
          }}
          className="group flex items-center gap-3 pl-4 pr-3 py-2.5 bg-ink text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 relative"
          style={{ transitionDelay: isOpen ? "100ms" : "0ms" }}
        >
          <span className="text-sm font-body tracking-wide">Support</span>
          <div className="w-10 h-10 bg-white text-ink rounded-full flex items-center justify-center">
            <Headphones className="w-5 h-5" strokeWidth={1.8} />
          </div>
          {hasUnreadAI && (
            <span className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        <a
          href="https://wa.me/923193773788?text=Hi%20ZAEM!%20I%20have%20a%20question%20about%20your%20products."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 pl-4 pr-3 py-2.5 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300"
          style={{ transitionDelay: isOpen ? "150ms" : "0ms" }}
        >
          <span className="text-sm font-body tracking-wide">WhatsApp</span>
          <div className="w-10 h-10 bg-white text-[#25D366] rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" strokeWidth={2} />
          </div>
        </a>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 bg-ink text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 ${
          isOpen ? "rotate-90" : "rotate-0"
        }`}
        aria-label={isOpen ? "Close menu" : "Open actions"}
      >
        <X
          className={`absolute w-6 h-6 transition-all duration-300 ${
            isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
          }`}
          strokeWidth={2}
        />
        <div
          className={`absolute w-full h-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
          }`}
        >
          <MessageCircle className="w-6 h-6" strokeWidth={1.8} />
        </div>

        {hasUnreadAI && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-medium text-white border-2 border-white">
            1
          </span>
        )}
      </button>
    </div>
  );
}