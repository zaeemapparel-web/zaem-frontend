export default function TermsPage() {
  return (
    <main className="bg-ivory text-ink min-h-screen">
      <section className="pt-20 md:pt-32 pb-16 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[900px] mx-auto">
          <p className="text-label text-gold mb-6">Legal</p>
          <h1 className="display-lg mb-6">Terms & Conditions</h1>
          <p className="text-muted font-body text-sm">
            Last updated: September 2026
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[900px] mx-auto space-y-10 text-muted font-body leading-relaxed">
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ZAEM, you agree to be bound by these Terms
              & Conditions. If you do not agree, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">2. Products & Pricing</h2>
            <p>
              All prices are in Pakistani Rupees (PKR) and subject to change
              without notice. We reserve the right to modify or discontinue
              products at any time.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">3. Orders</h2>
            <p>
              We reserve the right to refuse or cancel any order. All orders
              are subject to product availability and payment verification.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">4. Shipping & Delivery</h2>
            <p>
              Delivery times are estimates only and may vary. We are not liable
              for delays caused by courier services or circumstances beyond our
              control.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">5. Returns & Refunds</h2>
            <p>
              Our return policy allows returns within 7 days of delivery. Items
              must be unused and in original packaging. Refunds are processed
              within 5-7 business days.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">6. Intellectual Property</h2>
            <p>
              All content, logos, designs, and images are the property of ZAEM
              and protected by copyright laws.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">7. Contact</h2>
            <p>
              For questions about these Terms, contact us at
              zaemlifestyle@gmail.com.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}