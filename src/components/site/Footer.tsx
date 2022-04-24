import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

import { LogoMark } from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "New Arrivals", to: "/shop" },
      { label: "Best Sellers", to: "/shop" },
      { label: "Categories", to: "/categories" },
      { label: "Gifts", to: "/categories" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", to: "/our-story" },
      { label: "Meet the Artisans", to: "/artisans" },
      { label: "Our Mission", to: "/our-story" },
      { label: "Sustainability", to: "/our-story" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "FAQ", to: "/faq" },
      { label: "Track Order", to: "/account" },
    ],
  },
  {
    title: "Sell With Us",
    links: [
      { label: "Become an Artisan", to: "/sell" },
      { label: "Seller Login", to: "/auth" },
      { label: "Seller Guidelines", to: "/seller-guidelines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Refund Policy", to: "/refund-policy" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-clay text-background">
      <div className="container-craft grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <LogoMark className="h-9 w-9 text-saffron" />
            <span className="font-display text-lg">IndiTribe Crafts</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-background/70">
            Authentic Tribal Crafts. Stories Made by Hand.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: Twitter, label: "X" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`IndiTribe Crafts on ${label}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-background/25 text-background/80 transition-colors hover:border-saffron hover:text-saffron"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="font-display text-sm uppercase tracking-[0.14em] text-saffron">{column.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <Link to={link.to} className="text-sm text-background/75 transition-colors hover:text-background">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-background/15">
        <p className="container-craft py-5 text-xs text-background/60">
          © {new Date().getFullYear()} IndiTribe Crafts. Handmade in India.
        </p>
      </div>
    </footer>
  );
}
