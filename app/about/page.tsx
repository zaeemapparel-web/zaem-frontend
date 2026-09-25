"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ============ HERO ============ */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-label text-gold mb-6">Our Story</p>
          <h1 className="display-hero mb-10">
            Style.
            <br />
            <em className="font-display italic text-gold">Redefined.</em>
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed font-body max-w-2xl">
            ZAEM was born from a simple belief: true luxury is quiet. It
            doesn&apos;t shout, it doesn&apos;t chase trends — it simply
            exists, with intention.
          </p>
        </div>
      </section>

      {/* ============ HERO IMAGE ============ */}
      <section className="px-6 md:px-10 lg:px-16 pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto aspect-[16/9] bg-bone overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80"
            alt="ZAEM Atelier"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ============ STORY ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12 md:gap-24">
          <div>
            <p className="text-label text-gold mb-6">The Beginning</p>
            <h2 className="display-lg mb-8">
              Born in <em className="font-display italic">Mandi Bahauddin.</em>
            </h2>
          </div>
          <div className="space-y-6 text-muted text-base md:text-lg leading-relaxed font-body">
            <p>
              ZAEM began as a small atelier in Mandi Bahauddin, Pakistan — a city known
              for its rich heritage of craftsmanship. We started with a simple
              question: why should premium fashion be limited to a few?
            </p>
            <p>
              We set out to create a brand that combines the elegance of
              European design with the craftsmanship of South Asian artisans.
              Every piece we create is a meditation on form, function, and
              feeling.
            </p>
            <p>
              Today, ZAEM stands for considered design, premium quality, and
              quiet luxury — crafted for the discerning few.
            </p>
          </div>
        </div>
      </section>

      {/* ============ VALUES (Dark Section) ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 bg-ink text-ivory">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-label text-gold mb-6">Our Values</p>
          <h2 className="display-lg mb-16">
            What we <em className="font-display italic text-gold">stand for.</em>
          </h2>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            <div>
              <p className="font-display text-4xl text-gold mb-6">01</p>
              <h3 className="font-display text-2xl mb-4">Craftsmanship</h3>
              <p className="text-ivory/60 font-body text-sm leading-relaxed">
                Every stitch, every note, every detail — chosen with intention.
                We work with artisans who share our obsession with detail.
              </p>
            </div>
            <div>
              <p className="font-display text-4xl text-gold mb-6">02</p>
              <h3 className="font-display text-2xl mb-4">Sustainability</h3>
              <p className="text-ivory/60 font-body text-sm leading-relaxed">
                We choose materials that honor both the wearer and the earth.
                Timeless design over trend-driven consumption.
              </p>
            </div>
            <div>
              <p className="font-display text-4xl text-gold mb-6">03</p>
              <h3 className="font-display text-2xl mb-4">Accessibility</h3>
              <p className="text-ivory/60 font-body text-sm leading-relaxed">
                Premium shouldn&apos;t mean inaccessible. We bring considered
                design to those who value quality over quantity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-label text-gold mb-6">The Process</p>
          <h2 className="display-lg mb-16">
            From <em className="font-display italic">concept to creation.</em>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="aspect-[4/5] bg-bone overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80"
                alt="ZAEM Process"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-label text-gold mb-2">Step 01</p>
                <h3 className="font-display text-2xl mb-3">Design</h3>
                <p className="text-muted font-body leading-relaxed">
                  Each piece begins with a sketch — a dialogue between form and
                  function. We design with restraint, focusing on timeless
                  silhouettes that transcend seasons.
                </p>
              </div>
              <div>
                <p className="text-label text-gold mb-2">Step 02</p>
                <h3 className="font-display text-2xl mb-3">Craft</h3>
                <p className="text-muted font-body leading-relaxed">
                  Our artisans bring designs to life using traditional
                  techniques passed down through generations, combined with
                  modern precision.
                </p>
              </div>
              <div>
                <p className="text-label text-gold mb-2">Step 03</p>
                <h3 className="font-display text-2xl mb-3">Deliver</h3>
                <p className="text-muted font-body leading-relaxed">
                  Every piece is inspected, packaged, and delivered with care —
                  ready to become part of your story.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 bg-bone/30">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-label text-gold mb-6">Discover</p>
          <h2 className="display-lg mb-8">
            Join the <em className="font-display italic text-gold">journey.</em>
          </h2>
          <p className="text-muted text-base font-body mb-10 max-w-xl mx-auto">
            Explore our latest collection of premium clothing, perfumes, and
            bags — crafted for the discerning few.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary">
              Shop the Collection
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}