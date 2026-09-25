"use client";

import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 5000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 12000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[90] flex items-center gap-3 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {showTooltip && (
        <div className="hidden md:block bg-ivory border border-ink/10 shadow-xl px-5 py-3 animate-[fadeIn_0.5s_ease-out]">
          <p className="text-sm font-body text-ink whitespace-nowrap">
            Need help? Chat with us! 👋
          </p>
        </div>
      )}

      <a
        href="https://wa.me/923193773788?text=Hi%20ZAEM!%20I%20have%20a%20question%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-500"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" strokeWidth={2} />

        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" style={{ animationDelay: "0.5s" }} />

        {/* Notification dot */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-ivory animate-pulse" />
      </a>
    </div>
  );
}