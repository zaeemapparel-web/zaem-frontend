export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5 md:gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="font-display text-3xl md:text-4xl tracking-[0.25em] text-ink animate-pulse">
            ZAEM
          </div>
          <div className="text-[7px] md:text-[8px] tracking-[0.5em] text-ink/40 mt-1 text-center">
            EST. 2026
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-32 h-[2px] bg-bone rounded-full overflow-hidden">
          <div
            className="h-full bg-ink rounded-full animate-[loadingBar_1.5s_ease-in-out_infinite]"
            style={{
              width: "40%",
              animation: "loadingBar 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Text */}
        <p className="text-[9px] uppercase tracking-[0.4em] text-ink/40 font-body">
          Loading
        </p>
      </div>

      {/* Loading Bar Animation */}
      <style jsx>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </div>
  );
}