export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-6xl md:text-8xl tracking-[0.25em] text-ink animate-pulse">
          ZAEM
        </p>
        <p className="text-label text-gold mt-4 tracking-[0.5em]">
          EST. 2026
        </p>
        <div className="mt-8 w-40 h-0.5 bg-bone mx-auto overflow-hidden">
          <div className="h-full bg-gold animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}