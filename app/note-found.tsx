import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-ivory text-ink min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <p className="text-label text-gold mb-6">404 — Not Found</p>

        <h1 className="display-hero mb-8">
          404.
        </h1>

        <p className="font-display text-xl md:text-2xl mb-6">
          This page has{" "}
          <em className="italic text-gold">wondered off.</em>
        </p>

        <p className="text-muted text-base font-body mb-12 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-ink text-ivory text-label hover:bg-gold transition-colors duration-500"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-4 border border-ink text-label hover:bg-ink hover:text-ivory transition-colors duration-500"
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </main>
  );
}