"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        loginStore(data.data.user, data.data.token);
        router.push("/");
      } else {
        setError(data.message || "Registration failed");
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
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80"
          alt="ZAEM"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/10" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-display text-3xl text-ivory mb-4">
            Join the <em className="italic text-gold">inner circle.</em>
          </p>
          <p className="text-ivory/70 text-sm font-body max-w-md">
            Be the first to discover new collections, private sales, and stories from the atelier.
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

          <p className="text-label text-gold mb-4">New Here?</p>
          <h1 className="display-md mb-4">Create Account</h1>
          <p className="text-muted text-sm font-body mb-10">
            Join ZAEM and start your journey.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-ink/5 border-l-2 border-gold text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="text-label text-muted block mb-3">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                placeholder="Your full name"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors duration-500"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors duration-500"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="03001234567"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors duration-500"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                placeholder="Min. 6 characters"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors duration-500"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors duration-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-ink text-ivory text-label hover:bg-gold transition-colors duration-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm font-body text-muted mt-10">
            Already have an account?{" "}
            <Link href="/account/login" className="text-gold hover:text-ink transition-colors link-underline">
              Login
            </Link>
          </p>

        </div>
      </div>

    </main>
  );
}