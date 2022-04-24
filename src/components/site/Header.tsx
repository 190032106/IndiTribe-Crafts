import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCart, useWishlist } from "@/lib/cart";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "Artisans", to: "/artisans" },
  { label: "Our Story", to: "/our-story" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();

  const cartCount = cart?.reduce((total, line) => total + line.quantity, 0) ?? 0;
  const wishlistCount = wishlist?.length ?? 0;

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ to: "/shop", search: { q: term || undefined } });
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="motif-band h-1 w-full" aria-hidden="true" />
      <div className="bg-clay text-background">
        <p className="container-craft py-2 text-center text-[11px] uppercase tracking-[0.16em]">
          Handcrafted by Tribal Artisans • Supporting Indigenous Communities
        </p>
      </div>

      <div className="container-craft flex h-18 items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Logo />
        </div>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search products"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label={user ? "Your account" : "Sign in"}>
            <Link to={user ? "/account" : "/auth"}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label={`Wishlist, ${wishlistCount} items`}>
            <Link to="/wishlist" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && <CountBadge value={wishlistCount} />}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label={`Cart, ${cartCount} items`}>
            <Link to="/cart" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <CountBadge value={cartCount} />}
            </Link>
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border/70 bg-card">
          <form onSubmit={submitSearch} className="container-craft flex gap-2 py-3" role="search">
            <Input
              autoFocus
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search crafts, artisans, regions…"
              aria-label="Search products"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav aria-label="Mobile" className="border-t border-border/70 bg-card lg:hidden">
          <ul className="container-craft flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-border/50 py-3 text-base font-medium text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/sell"
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-base font-medium text-primary"
              >
                Become an Artisan
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function CountBadge({ value }: { value: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {value}
    </span>
  );
}
