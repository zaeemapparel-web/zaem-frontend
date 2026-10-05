export default function ShopLoading() {
  return (
    <main className="bg-ivory min-h-screen">
      {/* ==================== PAGE HEADER SKELETON ==================== */}
      <section className="pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-8 border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto">
          <div className="h-3 bg-bone rounded w-40 mb-4 animate-pulse" />
          <div className="h-10 md:h-14 bg-bone rounded w-64 md:w-96 mb-3 animate-pulse" />
          <div className="h-3 bg-bone rounded w-48 animate-pulse" />
        </div>
      </section>

      {/* ==================== FILTER BAR SKELETON ==================== */}
      <section className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-xl border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <div className="h-8 bg-bone rounded-full w-14 animate-pulse" />
              <div className="h-8 bg-bone rounded-full w-20 animate-pulse" />
              <div className="h-8 bg-bone rounded-full w-16 animate-pulse" />
              <div className="h-8 bg-bone rounded-full w-24 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-bone rounded-full w-16 animate-pulse" />
              <div className="h-8 bg-bone rounded-full w-20 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCTS SKELETON ==================== */}
      <section className="py-8 md:py-10 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar skeleton — desktop only */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="space-y-8">
                {/* Search */}
                <div>
                  <div className="h-3 bg-bone rounded w-16 mb-3 animate-pulse" />
                  <div className="h-10 bg-bone rounded w-full animate-pulse" />
                </div>

                {/* Categories */}
                <div>
                  <div className="h-3 bg-bone rounded w-20 mb-3 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-bone rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-bone rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-bone rounded animate-pulse w-4/5" />
                    <div className="h-4 bg-bone rounded animate-pulse w-3/5" />
                    <div className="h-4 bg-bone rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-bone rounded animate-pulse w-2/3" />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="h-3 bg-bone rounded w-12 mb-3 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-bone rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-bone rounded animate-pulse w-3/5" />
                    <div className="h-4 bg-bone rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-bone rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-bone rounded animate-pulse w-3/5" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Products grid skeleton */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-bone rounded-lg mb-3" />
                    <div className="h-2.5 bg-bone rounded mb-2 w-1/3" />
                    <div className="h-3.5 bg-bone rounded mb-2 w-3/4" />
                    <div className="h-2.5 bg-bone rounded w-1/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}