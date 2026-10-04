"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, Ruler, Check } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  availableSizes: string[];
  onSelectSize: (size: string) => void;
}

export default function SizeRecommender({
  isOpen,
  onClose,
  productId,
  productName,
  availableSizes,
  onSelectSize,
}: Props) {
  const [step, setStep] = useState<"input" | "result">("input");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    fit: "regular",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.height || !form.weight) {
      setError("Height aur weight zaroori hain");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/recommend-size`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: Number(form.height),
          weight: Number(form.weight),
          chest: form.chest ? Number(form.chest) : undefined,
          waist: form.waist ? Number(form.waist) : undefined,
          fit: form.fit,
          productId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setStep("result");
      } else {
        setError(data.message || "Failed to get recommendation");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (result?.recommended) {
      onSelectSize(result.recommended);
      onClose();
      setStep("input");
      setResult(null);
      setForm({ height: "", weight: "", chest: "", waist: "", fit: "regular" });
    }
  };

  const handleReset = () => {
    setStep("input");
    setResult(null);
    setError("");
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[110]"
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[111] w-auto sm:w-[480px] bg-ivory shadow-2xl max-h-[90vh] overflow-y-auto animate-[modalIn_0.3s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10 sticky top-0 bg-ivory z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-[#B8935A] rounded-full flex items-center justify-center">
              <Ruler className="w-5 h-5 text-ink" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-display text-lg leading-tight">Find My Size</p>
              <p className="text-[10px] text-ink/50 font-body uppercase tracking-widest">
                AI Powered
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bone rounded-full transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {step === "input" && (
            <form onSubmit={handleSubmit} className="space-y-5">

              <p className="text-sm text-ink/70 font-body">
                Apni measurements dein — AI best size recommend karega for{" "}
                <strong className="font-semibold">{productName}</strong>
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-2">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.height}
                    onChange={(e) =>
                      setForm({ ...form, height: e.target.value })
                    }
                    placeholder="165"
                    className="w-full bg-white border border-ink/15 focus:border-gold outline-none px-3 py-2.5 text-sm font-body transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    placeholder="55"
                    className="w-full bg-white border border-ink/15 focus:border-gold outline-none px-3 py-2.5 text-sm font-body transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-2">
                    Chest (in)
                  </label>
                  <input
                    type="number"
                    value={form.chest}
                    onChange={(e) =>
                      setForm({ ...form, chest: e.target.value })
                    }
                    placeholder="34"
                    className="w-full bg-white border border-ink/15 focus:border-gold outline-none px-3 py-2.5 text-sm font-body transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-2">
                    Waist (in)
                  </label>
                  <input
                    type="number"
                    value={form.waist}
                    onChange={(e) =>
                      setForm({ ...form, waist: e.target.value })
                    }
                    placeholder="28"
                    className="w-full bg-white border border-ink/15 focus:border-gold outline-none px-3 py-2.5 text-sm font-body transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-3">
                  Preferred Fit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["slim", "regular", "loose"].map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setForm({ ...form, fit })}
                      className={`py-2.5 text-xs uppercase tracking-wider font-body border transition-colors ${
                        form.fit === fit
                          ? "border-ink bg-ink text-ivory"
                          : "border-ink/15 hover:border-ink"
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 font-body">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-gold to-[#B8935A] text-ink text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Recommendation
                  </>
                )}
              </button>

              <p className="text-[10px] text-ink/40 text-center font-body">
                AI aapki measurements analyze karke best size batayega
              </p>
            </form>
          )}

          {step === "result" && result && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">

              {/* Main recommendation */}
              <div className="text-center py-6 border-2 border-dashed border-gold/40 rounded-lg bg-gradient-to-b from-gold/5 to-transparent">
                <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
                  Recommended Size
                </p>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-ink text-ivory mb-3">
                  <span className="font-display text-4xl">
                    {result.recommended}
                  </span>
                </div>
                <p className="text-xs text-ink/60 font-body">
                  {result.confidence}% confidence
                </p>

                {/* Confidence bar */}
                <div className="w-48 h-1 bg-bone rounded-full mx-auto mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-[#B8935A] transition-all duration-700"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Reason */}
              {result.reason && (
                <div className="bg-bone/50 p-4 border-l-2 border-gold">
                  <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-2">
                    Why this size
                  </p>
                  <p className="text-sm text-ink/80 font-body leading-relaxed whitespace-pre-line">
                    {result.reason}
                  </p>
                </div>
              )}

              {/* Alternative */}
              {result.alternative && (
                <div className="flex items-center justify-between p-3 bg-white border border-ink/10">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-ink/50 font-body mb-1">
                      Alternative
                    </p>
                    <p className="font-display text-lg">{result.alternative}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectSize(result.alternative);
                      onClose();
                    }}
                    className="px-4 py-2 text-[10px] uppercase tracking-widest border border-ink hover:bg-ink hover:text-ivory transition-colors"
                  >
                    Use this
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 h-12 border border-ink/20 text-xs uppercase tracking-widest hover:border-ink transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 h-12 bg-ink text-ivory text-xs uppercase tracking-widest hover:bg-gold transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Use {result.recommended}
                </button>
              </div>

              <p className="text-[10px] text-ink/40 text-center font-body">
                Ye recommendation AI ne aapki measurements ke hisaab se di hai
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}