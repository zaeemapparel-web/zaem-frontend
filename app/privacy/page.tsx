export default function PrivacyPage() {
  return (
    <main className="bg-ivory text-ink min-h-screen">
      <section className="pt-20 md:pt-32 pb-16 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[900px] mx-auto">
          <p className="text-label text-gold mb-6">Legal</p>
          <h1 className="display-lg mb-6">Privacy Policy</h1>
          <p className="text-muted font-body text-sm">
            Last updated: September 2026
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[900px] mx-auto space-y-10 text-muted font-body leading-relaxed">
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us — such as your
              name, email, phone number, and shipping address when you create
              an account or place an order.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">2. How We Use Your Information</h2>
            <p>
              We use your information to process orders, communicate with you
              about your orders, send marketing communications (with your
              consent), and improve our services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              personal information. All payment transactions are encrypted and
              processed through secure gateways.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">4. Sharing Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share information with service providers who help
              us operate our business.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal
              information. Contact us at zaemlifestyle@gmail.com to exercise
              these rights.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at
              zaemlifestyle@gmail.com.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}