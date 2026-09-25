import Link from "next/link";

export default function ReturnsPage() {
  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ============ HERO ============ */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-label text-gold mb-6">Information</p>
          <h1 className="display-lg mb-6">Returns & Exchanges</h1>
          <p className="text-muted text-base md:text-lg leading-relaxed font-body max-w-2xl">
            If you&apos;re not completely satisfied with your purchase, we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1000px] mx-auto space-y-12 text-muted font-body leading-relaxed">

          {/* Highlight */}
          <div className="bg-bone/50 p-6 md:p-8 border-l-2 border-gold">
            <p className="text-label text-gold mb-3">7-Day Returns</p>
            <p className="text-ink font-display text-xl mb-2">
              Easy Returns Within 7 Days
            </p>
            <p className="text-sm">
              If you&apos;re not satisfied, return it within 7 days of delivery for a
              full refund or exchange.
            </p>
          </div>

          {/* Eligibility */}
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">
              Eligibility
            </h2>
            <ul className="space-y-3 list-disc pl-6">
              <li>Item must be unused and in original condition</li>
              <li>Original packaging must be intact</li>
              <li>Tags must be attached</li>
              <li>Return request within 7 days of delivery</li>
              <li>Original receipt or order confirmation required</li>
            </ul>
          </div>

          {/* Non-Returnable */}
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">
              Non-Returnable Items
            </h2>
            <ul className="space-y-3 list-disc pl-6">
              <li>Opened perfumes (hygiene reasons)</li>
              <li>Opened body mists and fragrance sets</li>
              <li>Customized or personalized items</li>
              <li>Items marked as final sale</li>
              <li>Intimate wear and inner garments</li>
            </ul>
          </div>

          {/* How to Return */}
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">
              How to Return
            </h2>
            <ol className="space-y-3 list-decimal pl-6">
              <li>Contact us via WhatsApp with your order number</li>
              <li>We&apos;ll provide you with return instructions and pickup details</li>
              <li>Pack the item securely in original packaging</li>
              <li>Hand over to our courier partner</li>
              <li>We&apos;ll process your refund or exchange within 5-7 business days</li>
            </ol>
          </div>

          {/* Refunds */}
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Refunds</h2>
            <p>
              Refunds are processed to your original payment method or bank
              transfer within 5-7 business days after we receive and inspect
              the returned item.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Cash on Delivery (COD) orders:</strong>{" "}
              Refunds are issued via bank transfer or Easypaisa/JazzCash.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Shipping charges:</strong> Shipping
              fees are non-refundable unless the return is due to our error or
              a defective item.
            </p>
          </div>

          {/* Exchanges */}
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Exchanges</h2>
            <p>
              We offer free exchanges for size or color within 7 days. Simply
              contact us and we&apos;ll arrange a pickup and deliver the new item.
            </p>
            <p className="mt-3">
              Exchanges are subject to stock availability.
            </p>
          </div>

          {/* Damaged / Defective */}
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">
              Damaged or Defective Items
            </h2>
            <p>
              If you receive a damaged or defective item, please contact us
              within <strong className="text-ink">48 hours</strong> of delivery
              with photos. We&apos;ll replace it free of charge or issue a full
              refund including shipping.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="pt-8 border-t border-ink/10">
            <h2 className="font-display text-2xl text-ink mb-4">
              Need to Return Something?
            </h2>
            <p className="mb-6">
              Contact our team on WhatsApp and we&apos;ll guide you through the
              process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/923193773788?text=Hi%20ZAEM!%20I%20want%20to%20return%20an%20item."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center"
              >
                Contact on WhatsApp
              </a>
              <Link
                href="/contact"
                className="btn-outline inline-flex items-center justify-center"
              >
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ============ BOTTOM CTA ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 bg-ink text-ivory">
        <div className="max-w-[1000px] mx-auto text-center">
          <p className="text-label text-gold mb-6">Shop With Confidence</p>
          <h2 className="display-lg mb-8">
            Explore the{" "}
            <em className="font-display italic text-gold">collection.</em>
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-10 py-5 bg-gold text-ink text-label hover:bg-ivory transition-colors duration-500"
          >
            Shop Now
          </Link>
        </div>
      </section>

    </main>
  );
}