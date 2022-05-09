import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/format";
import { useAddToCart, useToggleWishlist, useWishlistDetailed } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Saved crafts — IndiTribe Crafts" },
      { name: "description", content: "The handmade tribal pieces you've saved for later." },
      { property: "og:title", content: "Saved crafts — IndiTribe Crafts" },
      { property: "og:description", content: "The handmade tribal pieces you've saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading } = useAuth();
  const { data: items, isLoading } = useWishlistDetailed();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();

  if (loading || isLoading) {
    return (
      <div className="container-craft py-14">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-craft py-24 text-center">
        <h1 className="font-display text-3xl">Sign in to see your saved crafts</h1>
        <Button className="mt-6" asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-craft py-12">
      <h1 className="font-display text-4xl text-foreground">Saved crafts</h1>
      <p className="mt-2 text-muted-foreground">Pieces you've kept an eye on.</p>

      {!items || items.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-border p-14 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Nothing saved yet.</p>
          <Button className="mt-6" asChild>
            <Link to="/shop">Browse the collection</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-craft">
              <Link to="/product/$slug" params={{ slug: item.slug }}>
                <img
                  src={item.image_url ?? "/images/products/warli-wall-art.jpg"}
                  alt={item.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </Link>
              <div className="space-y-2 p-4">
                <h2 className="font-display text-lg">
                  <Link to="/product/$slug" params={{ slug: item.slug }} className="hover:text-primary">
                    {item.name}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">by {item.artisan_name}</p>
                <p className="font-display text-lg">{formatINR(item.price)}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1" onClick={() => addToCart.mutate({ productId: item.product_id })}>
                    Add to bag
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleWishlist.mutate(item.product_id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
