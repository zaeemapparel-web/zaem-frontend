"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, MessageCircle } from "lucide-react";

const FAQS = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "How long does delivery take?",
        a: "Orders within Pakistan are typically delivered within 3-5 business days. For remote areas, it may take up to 7 business days.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free shipping on all orders above Rs. 5,000. For orders below that, a flat shipping fee of Rs. 250 applies.",
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your order is shipped, you'll receive a tracking number via WhatsApp and email. You can also check your order status in your account dashboard.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, we only ship within Pakistan. International shipping is coming soon.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day easy return policy. If you're not satisfied with your purchase, you can return it within 7 days of delivery for a full refund or exchange.",
      },
      {
        q: "How do I initiate a return?",
        a: "Simply contact us via WhatsApp or email with your order number, and we'll guide you through the process. The item must be unused and in its original packaging.",
      },
      {
        q: "Are there any items that cannot be returned?",
        a: "For hygiene reasons, perfumes that have been opened cannot be returned. All other items are eligible for returns within 7 days.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    questions: [
      {
        q: "How do I know which size to order?",
        a: "Check our Size Guide for detailed measurements. If you're between sizes, we recommend sizing up for a relaxed fit.",
      },
      {
        q: "Are your perfumes long-lasting?",
        a: "Yes! Our perfumes are formulated with high concentrations of fragrance oils for long-lasting wear — typically 6-8 hours.",
      },
      {
        q: "Do you restock sold-out items?",
        a: "Popular items are restocked regularly. Subscribe to our newsletter or follow us on Instagram for restock alerts.",
      },
    ],
  },
  {
    category: "Payments",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Cash on Delivery (COD), JazzCash, Easypaisa, and Credit/Debit Cards.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available all over Pakistan. You pay when you receive your order.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. All online payments are processed through secure, encrypted gateways. We never store your card details.",
      },
    ],
  },
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* Hero */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1000px] mx-auto text-center">
          <p className="text-label text-gold mb-6">Help Center</p>
          <h1 className="display-hero mb-8">
            Questions?{" "}
            <em className="font-display italic text-gold">Answered.</em>
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed font-body max-w-2xl mx-auto">
            Everything you need to know about ZAEM — orders, shipping,
            returns, and more.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[900px] mx-auto space-y-16">
          {FAQS.map((group) => (
            <div key={group.category}>
              <p className="text-label text-gold mb-8">{group.category}</p>

              <div className="space-y-3">
                {group.questions.map((item, i) => {
                  const key = `${group.category}-${i}`;
                  const isOpen = openIndex === key;

                  return (
                    <div
                      key={key}
                      className="border border-ink/10 hover:border-ink/20 transition-colors"
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
                      >
                        <span className="font-display text-base md:text-lg pr-4">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <Minus className="w-4 h-4 text-gold shrink-0" strokeWidth={1.5} />
                        ) : (
                          <Plus className="w-4 h-4 text-muted shrink-0" strokeWidth={1.5} />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-5 md:px-6 pb-5 md:pb-6">
                          <p className="text-muted text-sm md:text-base font-body leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 bg-ink text-ivory">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-label text-gold mb-6">Still Need Help?</p>
          <h2 className="display-lg mb-8">
            We&apos;re <em className="font-display italic text-gold">here.</em>
          </h2>
          <p className="text-ivory/60 text-base font-body mb-10 max-w-xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/923193773788"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-ink text-label hover:bg-ivory transition-colors"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border border-ivory/30 text-ivory text-label hover:bg-ivory hover:text-ink transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}