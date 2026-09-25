import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Clothing", href: "/shop?category=clothing" },
    { label: "Perfumes", href: "/shop?category=perfumes" },
    { label: "Bags", href: "/shop?category=bags" },
    { label: "Sale", href: "/shop?sale=true" },
  ],
  help: [
    { label: "Size Guide", href: "/size-guide" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQs", href: "/faqs" },
    { label: "Contact", href: "/contact" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Craftsmanship", href: "/about#craft" },
    { label: "Sustainability", href: "/about#sustain" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/zaem" },
  { label: "Facebook", href: "https://facebook.com/zaem" },
  { label: "Email", href: "mailto:zaemlifestyle@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-ivory pt-20 md:pt-32 pb-8">
      <div className="max-w-[1800px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Top Section — Newsletter */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 pb-20 md:pb-32 border-b border-ivory/10">
          <div>
            <p className="text-label text-gold mb-6">Newsletter</p>
            <h3 className="display-lg mb-6">
              Join the <em className="font-display italic">inner circle.</em>
            </h3>
            <p className="text-ivory/60 font-body text-sm max-w-md">
              Be the first to discover new collections, private sales, and
              stories from the atelier.
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <form className="flex border-b border-ivory/30 pb-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent text-ivory placeholder:text-ivory/40 text-sm font-body outline-none"
              />
              <button
                type="submit"
                className="text-label hover:text-gold transition-colors duration-500 flex items-center gap-2"
              >
                Subscribe
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Middle Section — Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-6 py-16 md:py-24">
          {/* Brand Info (Left) */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="font-display text-3xl tracking-[0.15em] block mb-6"
            >
              ZAEM
            </Link>
            <p className="text-ivory/60 font-body text-xs leading-relaxed mb-8 max-w-xs">
              Premium quality. Considered design. Crafted for the discerning.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <a
                href="mailto:zaemlifestyle@gmail.com"
                className="flex items-center gap-3 text-ivory/60 hover:text-gold transition-colors duration-500 text-xs"
              >
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                zaemlifestyle@gmail.com
              </a>
              <a
                href="tel:+923193773788"
                className="flex items-center gap-3 text-ivory/60 hover:text-gold transition-colors duration-500 text-xs"
              >
                <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                +92 319 3773788
              </a>
              <p className="flex items-center gap-3 text-ivory/60 text-xs">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                Mandi Bahauddin, Pakistan
              </p>
            </div>
          </div>

          {/* Spacer for desktop */}
          <div className="hidden md:block" />

          {/* Shop Links */}
          <div>
            <p className="text-label text-gold mb-6">Shop</p>
            <ul className="space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ivory/70 hover:text-ivory transition-colors duration-500 font-body text-xs link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <p className="text-label text-gold mb-6">Help</p>
            <ul className="space-y-3">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ivory/70 hover:text-ivory transition-colors duration-500 font-body text-xs link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <p className="text-label text-gold mb-6">About</p>
            <ul className="space-y-3">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ivory/70 hover:text-ivory transition-colors duration-500 font-body text-xs link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-8 border-t border-ivory/10 gap-6">
          <div className="flex items-center gap-8">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/60 hover:text-gold transition-colors duration-500 text-label"
              >
                {social.label}
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {FOOTER_LINKS.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ivory/40 hover:text-ivory transition-colors duration-500 font-body text-[10px] tracking-wider uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom — Big Wordmark + Copyright */}
        <div className="pt-16 md:pt-24 overflow-hidden">
          <h2 className="font-display text-[20vw] leading-[0.8] tracking-[-0.02em] text-ivory/10 select-none whitespace-nowrap">
            ZAEM
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-8 border-t border-ivory/10 gap-4">
          <p className="text-ivory/40 font-body text-[10px] tracking-wider uppercase">
            © 2026 ZAEM. All rights reserved.
          </p>
          <p className="text-ivory/40 font-body text-[10px] tracking-wider uppercase">
            Crafted in Mandi Bahauddin, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}