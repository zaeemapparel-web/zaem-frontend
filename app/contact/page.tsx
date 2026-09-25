"use client";

import { useState } from "react";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandWhatsapp,
  IconClock,
  IconSend,
  IconBrandInstagram,
  IconBrandFacebook,
} from "@tabler/icons-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ============ HERO ============ */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-label text-gold mb-6">Get in Touch</p>
          <h1 className="display-hero mb-8">
            Let&apos;s <em className="font-display italic text-gold">talk.</em>
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed font-body max-w-2xl">
            Have a question, feedback, or just want to say hello? We&apos;d love
            to hear from you. Our team is here to help.
          </p>
        </div>
      </section>

      {/* ============ CONTACT GRID ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">

          {/* ============ LEFT — FORM ============ */}
          <div className="lg:col-span-7">
            <p className="text-label text-gold mb-6">Send a Message</p>
            <h2 className="display-md mb-8">
              We&apos;ll reply within 24 hours.
            </h2>

            {submitted && (
              <div className="mb-8 p-4 bg-gold/10 border-l-2 border-gold text-sm font-body text-gold">
                ✓ Thank you! Your message has been sent. We&apos;ll be in touch
                soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-label text-muted block mb-3">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                </div>
                <div>
                  <label className="text-label text-muted block mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-label text-muted block mb-3">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="03001234567"
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                </div>
                <div>
                  <label className="text-label text-muted block mb-3">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="What is this about?"
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-label text-muted block mb-3">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Tell us how we can help..."
                  className="w-full bg-transparent border border-ink/20 focus:border-gold outline-none p-4 text-sm font-body transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                <IconSend className="w-4 h-4" strokeWidth={1.5} />
                Send Message
              </button>
            </form>
          </div>

          {/* ============ RIGHT — INFO ============ */}
          <div className="lg:col-span-5">
            <div className="bg-bone/50 p-8 md:p-10 lg:sticky lg:top-28">

              <p className="text-label text-gold mb-6">Contact Information</p>
              <h3 className="font-display text-2xl mb-8">
                Other ways to reach us.
              </h3>

              <div className="space-y-6 mb-10">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/923193773788"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-11 h-11 bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366] transition-colors">
                    <IconBrandWhatsapp
                      className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-label text-muted mb-1">WhatsApp</p>
                    <p className="font-display text-base group-hover:text-gold transition-colors">
                      +92 319 3773788
                    </p>
                    <p className="text-xs text-muted font-body mt-1">
                      Fastest response
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:zaemlifestyle@gmail.com"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-11 h-11 bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors">
                    <IconMail
                      className="w-5 h-5 text-gold group-hover:text-ivory transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-label text-muted mb-1">Email</p>
                    <p className="font-display text-base group-hover:text-gold transition-colors break-all">
                      zaemlifestyle@gmail.com
                    </p>
                    <p className="text-xs text-muted font-body mt-1">
                      Response within 24 hours
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:+923193773788"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-11 h-11 bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors">
                    <IconPhone
                      className="w-5 h-5 text-gold group-hover:text-ivory transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-label text-muted mb-1">Phone</p>
                    <p className="font-display text-base group-hover:text-gold transition-colors">
                      +92 319 3773788
                    </p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-gold/10 flex items-center justify-center shrink-0">
                    <IconMapPin
                      className="w-5 h-5 text-gold"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-label text-muted mb-1">Location</p>
                    <p className="font-display text-base">
                      Mandi Bahauddin, Pakistan
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-gold/10 flex items-center justify-center shrink-0">
                    <IconClock
                      className="w-5 h-5 text-gold"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-label text-muted mb-1">Hours</p>
                    <p className="font-display text-base">
                      Mon — Sat, 10 AM — 8 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="pt-8 border-t border-ink/10">
                <p className="text-label text-muted mb-4">Follow Us</p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com/zaem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-ink/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                    aria-label="Instagram"
                  >
                    <IconBrandInstagram className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  <a
                    href="https://facebook.com/zaem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-ink/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                    aria-label="Facebook"
                  >
                    <IconBrandFacebook className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  <a
                    href="https://wa.me/923193773788"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-ink/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                    aria-label="WhatsApp"
                  >
                    <IconBrandWhatsapp className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 bg-ink text-ivory">
        <div className="max-w-[1400px] mx-auto text-center">
          <p className="text-label text-gold mb-6">Ready to Shop?</p>
          <h2 className="display-lg mb-8">
            Explore the{" "}
            <em className="font-display italic text-gold">collection.</em>
          </h2>
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-4 bg-gold text-ink text-label hover:bg-ivory transition-colors"
          >
            Shop Now
          </a>
        </div>
      </section>

    </main>
  );
}