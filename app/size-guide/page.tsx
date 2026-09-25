"use client";

import Link from "next/link";

const SIZE_CHARTS = {
  clothing: {
    title: "Clothing Size Chart",
    columns: ["Size", "Chest (in)", "Waist (in)", "Length (in)", "Shoulder (in)"],
    rows: [
      ["XS", "34-36", "28-30", "26", "16"],
      ["S", "36-38", "30-32", "27", "17"],
      ["M", "38-40", "32-34", "28", "18"],
      ["L", "40-42", "34-36", "29", "19"],
      ["XL", "42-44", "36-38", "30", "20"],
      ["XXL", "44-46", "38-40", "31", "21"],
    ],
  },
};

export default function SizeGuidePage() {
  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* Hero */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-label text-gold mb-6">Find Your Fit</p>
          <h1 className="display-hero mb-8">
            Size <em className="font-display italic text-gold">Guide.</em>
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed font-body max-w-2xl">
            Use our detailed size charts to find the perfect fit. All
            measurements are in inches.
          </p>
        </div>
      </section>

      {/* How to Measure */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-label text-gold mb-8">How to Measure</p>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="border border-ink/10 p-6 md:p-8">
              <p className="font-display text-4xl text-gold mb-4">01</p>
              <h3 className="font-display text-xl mb-3">Chest</h3>
              <p className="text-muted text-sm font-body leading-relaxed">
                Measure around the fullest part of your chest, keeping the
                tape measure horizontal and parallel to the floor.
              </p>
            </div>

            <div className="border border-ink/10 p-6 md:p-8">
              <p className="font-display text-4xl text-gold mb-4">02</p>
              <h3 className="font-display text-xl mb-3">Waist</h3>
              <p className="text-muted text-sm font-body leading-relaxed">
                Measure around your natural waistline — the narrowest part of
                your torso, usually just above the belly button.
              </p>
            </div>

            <div className="border border-ink/10 p-6 md:p-8">
              <p className="font-display text-4xl text-gold mb-4">03</p>
              <h3 className="font-display text-xl mb-3">Length</h3>
              <p className="text-muted text-sm font-body leading-relaxed">
                Measure from the highest point of your shoulder down to the
                desired hem length.
              </p>
            </div>

            <div className="border border-ink/10 p-6 md:p-8">
              <p className="font-display text-4xl text-gold mb-4">04</p>
              <h3 className="font-display text-xl mb-3">Shoulder</h3>
              <p className="text-muted text-sm font-body leading-relaxed">
                Measure across your back from the edge of one shoulder to the
                other, keeping the tape straight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Size Tables */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 bg-bone/30">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-label text-gold mb-8">Clothing Size Chart</p>
          <h2 className="display-lg mb-12">
            Find your <em className="font-display italic">perfect size.</em>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-ink/20">
                  {SIZE_CHARTS.clothing.columns.map((col) => (
                    <th
                      key={col}
                      className="text-left py-4 px-4 text-label text-gold"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_CHARTS.clothing.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-ink/10 hover:bg-ivory transition-colors"
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`py-4 px-4 text-sm font-body ${
                          j === 0 ? "font-display text-base" : "text-muted"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="border-l-2 border-gold p-6 bg-ivory">
              <p className="text-label text-gold mb-3">Tip</p>
              <p className="text-sm font-body text-muted leading-relaxed">
                If you&apos;re between two sizes, we recommend choosing the
                larger size for a more relaxed fit.
              </p>
            </div>

            <div className="border-l-2 border-gold p-6 bg-ivory">
              <p className="text-label text-gold mb-3">Note</p>
              <p className="text-sm font-body text-muted leading-relaxed">
                All measurements are in inches. Allow 0.5 — 1 inch variance
                due to handcrafted nature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfume Info */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-label text-gold mb-8">Perfume Sizes</p>
          <h2 className="display-lg mb-12">
            Choose your <em className="font-display italic">signature.</em>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                size: "30ml",
                desc: "Perfect for travel or trying a new scent.",
              },
              {
                size: "50ml",
                desc: "Our most popular size. Ideal for daily wear.",
              },
              {
                size: "100ml",
                desc: "Best value. A lasting signature scent.",
              },
            ].map((item) => (
              <div
                key={item.size}
                className="border border-ink/10 p-6 md:p-8 text-center hover:border-gold transition-colors"
              >
                <p className="font-display text-4xl mb-4">{item.size}</p>
                <p className="text-muted text-sm font-body leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 bg-ink text-ivory">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-label text-gold mb-6">Still Unsure?</p>
          <h2 className="display-lg mb-8">
            We&apos;re here to <em className="font-display italic text-gold">help.</em>
          </h2>
          <p className="text-ivory/60 text-base font-body mb-10 max-w-xl mx-auto">
            Contact us on WhatsApp and we&apos;ll help you find the perfect size.
          </p>
          <a
            href="https://wa.me/923193773788?text=Hi%20ZAEM!%20I%20need%20help%20with%20sizing."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-gold text-ink text-label hover:bg-ivory transition-colors"
          >
            Ask on WhatsApp
          </a>
        </div>
      </section>

    </main>
  );
}