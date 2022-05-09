import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/format";
import { useCart, useRemoveCartItem, useToggleWishlist, useUpdateCartQuantity } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — IndiTribe Crafts" },
      { name: "description", content: "Review the handmade tribal crafts in your bag before checkout." },
      { property: "og:title", content: "Your bag — IndiTribe Crafts" },
      { property: "og:description", content: "Review your handmade tribal crafts before checkout." },
    ],
  }),
  component: CartPage,
});

export function cartTotals(subtotal: number) {
  const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  return { shipping, tax, total: subtotal + shipping + tax };
}

function CartPage() {
  const { user, loading } = useAuth();
  const { data: lines, isLoading } = useCart();
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveCartItem();
  const toggleWishlist = useToggleWishlist();

  if (loading) {
    return (
      <div className="container-craft py-14">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in to see your bag"
        body="Your bag is saved to your account so it follows you between devices."
        actionLabel="Sign in"
        actionTo="/auth"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container-craft py-14">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!lines || lines.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        body="Browse the collection and find a piece with a story worth keeping."
        actionLabel="Shop the collection"
        actionTo="/shop"
      />
    );
  }

  const subtotal = lines.reduce((total, line) => total + line.price * line.quantity, 0);
  const { shipping, tax, total } = cartTotals(subtotal);

  return (
    <div className="container-craft py-12">
      <h1 className="font-display text-4xl text-foreground">Your bag</h1>
      <p className="mt-2 text-muted-foreground">{lines.length} item{lines.length > 1 ? "s" : ""} from IndiTribe artisans.</p>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-4 rounded-lg border border-border/70 bg-card p-4 shadow-craft">
              <img
                src={line.image_url ?? "/images/products/warli-wall-art.jpg"}
                alt={line.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="h-24 w-24 shrink-0 rounded-md object-cover sm:h-28 sm:w-28"
              />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg">
                      <Link to="/product/$slug" params={{ slug: line.slug }} className="hover:text-primary">
                        {line.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">by {line.artisan_name}</p>
                  </div>
                  <p className="font-display text-lg">{formatINR(line.price * line.quantity)}</p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-md border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Decrease quantity of ${line.name}`}
                      onClick={() => updateQuantity.mutate({ id: line.id, quantity: line.quantity - 1 })}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-9 text-center text-sm">{line.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Increase quantity of ${line.name}`}
                      disabled={line.quantity >= line.stock}
                      onClick={() => updateQuantity.mutate({ id: line.id, quantity: line.quantity + 1 })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleWishlist.mutate(line.product_id)}>
                    <Heart className="mr-2 h-4 w-4" /> Save for later
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(line.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-border/70 bg-card p-6 shadow-craft">
          <h2 className="font-display text-xl">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
            <Row label="Discount" value="—" />
            <Row label="Tax (5% GST)" value={formatINR(tax)} />
            <div className="border-t border-border pt-3">
              <Row label="Total" value={formatINR(total)} bold />
            </div>
          </dl>
          <Button className="mt-6 w-full" asChild>
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button variant="ghost" className="mt-2 w-full" asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "font-display text-lg text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function EmptyState({
  title,
  body,
  actionLabel,
  actionTo,
}: {
  title: string;
  body: string;
  actionLabel: string;
  actionTo: "/auth" | "/shop";
}) {
  return (
    <div className="container-craft py-24 text-center">
      <h1 className="font-display text-3xl text-foreground">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{body}</p>
      <Button className="mt-7" asChild>
        <Link to={actionTo}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
