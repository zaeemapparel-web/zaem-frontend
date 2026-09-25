export default function ShippingPage() {
  return (
    <main className="bg-ivory text-ink min-h-screen">
      <section className="pt-20 md:pt-32 pb-16 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[900px] mx-auto">
          <p className="text-label text-gold mb-6">Information</p>
          <h1 className="display-lg mb-6">Shipping Info</h1>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[900px] mx-auto space-y-10 text-muted font-body leading-relaxed">

          <div className="bg-bone/50 p-6 md:p-8 border-l-2 border-gold">
            <p className="text-label text-gold mb-3">Free Shipping</p>
            <p className="text-ink font-display text-xl mb-2">
              Free on Orders Above Rs. 5,000
            </p>
            <p className="text-sm">
              Below Rs. 5,000 — flat Rs. 250 shipping fee.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Delivery Time</h2>
            <ul className="space-y-3 list-disc pl-6">
              <li>Major cities (Lahore, Karachi, Islamabad): 2-3 business days</li>
              <li>Other cities: 3-5 business days</li>
              <li>Remote areas: up to 7 business days</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Tracking Your Order</h2>
            <p>
              Once your order is shipped, you&apos;ll receive a tracking number
              via WhatsApp and email. You can also track your order in your
              account dashboard under "My Orders".
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Delivery Areas</h2>
            <p>
              We currently deliver all over Pakistan. International shipping is
              coming soon.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Cash on Delivery</h2>
            <p>
              COD is available all over Pakistan. You pay when you receive your
              order — simple and secure.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}