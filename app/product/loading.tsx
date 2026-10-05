export default function ProductLoading() {
  return (
    <main className="bg-ivory min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Breadcrumb skeleton */}
        <div className="h-3 bg-bone rounded w-48 mb-6 md:mb-8 animate-pulse" />

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Images skeleton */}
          <div>
            <div className="aspect-[3/4] bg-bone rounded-lg mb-3 animate-pulse" />
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-bone rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-4">
            <div className="h-3 bg-bone rounded w-24 animate-pulse" />
            <div className="h-8 md:h-10 bg-bone rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-bone rounded w-32 animate-pulse" />
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-bone rounded w-full animate-pulse" />
              <div className="h-3 bg-bone rounded w-5/6 animate-pulse" />
              <div className="h-3 bg-bone rounded w-4/6 animate-pulse" />
            </div>
            <div className="pt-4">
              <div className="h-3 bg-bone rounded w-16 mb-3 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-11 bg-bone rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="pt-4">
              <div className="h-13 bg-bone rounded-lg w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}