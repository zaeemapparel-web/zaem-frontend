"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZES = [
  { size: "XS", chest: "34-36", waist: "28-30", hips: "34-36", length: "26" },
  { size: "S", chest: "36-38", waist: "30-32", hips: "36-38", length: "27" },
  { size: "M", chest: "38-40", waist: "32-34", hips: "38-40", length: "28" },
  { size: "L", chest: "40-42", waist: "34-36", hips: "40-42", length: "29" },
  { size: "XL", chest: "42-44", waist: "36-38", hips: "42-44", length: "30" },
  { size: "XXL", chest: "44-46", waist: "38-40", hips: "44-46", length: "31" },
];

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-ivory max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeIn_0.4s_ease-out]">
        <div className="sticky top-0 bg-ivory border-b border-ink/10 px-6 md:px-8 py-5 flex items-center justify-between z-10">
          <div>
            <p className="text-label text-gold mb-1">Size Guide</p>
            <h3 className="font-display text-2xl">Find Your Fit</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-bone transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <p className="text-muted text-sm font-body mb-6">
            All measurements are in inches. If you&apos;re between sizes, we recommend choosing the larger size.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-ink/20">
                  <th className="text-left py-3 px-3 text-label text-gold">Size</th>
                  <th className="text-left py-3 px-3 text-label text-gold">Chest</th>
                  <th className="text-left py-3 px-3 text-label text-gold">Waist</th>
                  <th className="text-left py-3 px-3 text-label text-gold">Hips</th>
                  <th className="text-left py-3 px-3 text-label text-gold">Length</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((row) => (
                  <tr key={row.size} className="border-b border-ink/10 hover:bg-bone/50 transition-colors">
                    <td className="py-3 px-3 font-display text-base">{row.size}</td>
                    <td className="py-3 px-3 text-sm font-body text-muted">{row.chest}</td>
                    <td className="py-3 px-3 text-sm font-body text-muted">{row.waist}</td>
                    <td className="py-3 px-3 text-sm font-body text-muted">{row.hips}</td>
                    <td className="py-3 px-3 text-sm font-body text-muted">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-bone/50 p-4 border-l-2 border-gold">
              <p className="text-label text-gold mb-2">Tip</p>
              <p className="text-xs font-body text-muted leading-relaxed">
                Measure over light clothing for accurate results.
              </p>
            </div>
            <div className="bg-bone/50 p-4 border-l-2 border-gold">
              <p className="text-label text-gold mb-2">Note</p>
              <p className="text-xs font-body text-muted leading-relaxed">
                Allow 0.5-1 inch variance due to handcrafted nature.
              </p>
            </div>
            <div className="bg-bone/50 p-4 border-l-2 border-gold">
              <p className="text-label text-gold mb-2">Help</p>
              <p className="text-xs font-body text-muted leading-relaxed">
                Still unsure? Contact us on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}