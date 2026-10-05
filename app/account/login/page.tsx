"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (data.success) {
        loginStore(data.data.user, data.data.token);
        router.push("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-ivory text-ink min-h-screen flex">

      {/* LEFT — Image (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-bone">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
          alt="ZAEM"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/10" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-display text-3xl text-ivory mb-4">
            Style. <em className="italic text-gold">Redefined.</em>
          </p>
          <p className="text-ivory/70 text-sm font-body max-w-md">
            Premium quality. Considered design. Crafted for the discerning.
          </p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 md:px-12 py-16">
        <div className="w-full max-w-md">

          {/* Logo (Mobile) */}
          <Link href="/" className="block font-display text-3xl tracking-[0.15em] mb-12 lg:hidden">
            ZAEM
          </Link>

          {/* Heading */}
          <p className="text-label text-gold mb-4">Welcome Back</p>
          <h1 className="display-md mb-4">Login</h1>
          <p className="text-muted text-sm font-body mb-10">
            Enter your credentials to continue.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-ink/5 border-l-2 border-gold text-sm font-body">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="text-label text-muted block mb-3">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors duration-500"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors duration-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-ink text-ivory text-label hover:bg-gold transition-colors duration-500 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center text-sm font-body text-muted mt-10">
  <Link
    href="/account/register"
    className="inline-block text-gold hover:text-ink transition-colors font-medium underline underline-offset-4 py-3 px-4"
  >
    Don&apos;t have an account? Create one →
  </Link>
</div>

        </div>
      </div>

    </main>
  );
}