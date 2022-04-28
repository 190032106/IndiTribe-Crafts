import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shop/StarRating";
import { formatINR, discountPercent } from "@/lib/format";
import { useAddToCart, useToggleWishlist, useWishlist } from "@/lib/cart";
import type { ProductSummary } from "@/lib/catalog.functions";

export function ProductCard({ product, view = "grid" }: { product: ProductSummary; view?: "grid" | "list" }) {
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();
  const saved = wishlist?.some((item) => item.product_id === product.id) ?? false;
  const discount = discountPercent(product.price, product.compare_at_price);

  const media = (
    <div className="relative overflow-hidden rounded-md bg-secondary">
      <img
        src={product.image_url ?? "/images/products/warli-wall-art.jpg"}
        alt={product.name}
        loading="lazy"
        width={1024}
        height={1024}
        className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {discount && (
        <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
          {discount}% off
        </span>
      )}
      {product.stock === 0 && (
        <span className="absolute left-3 bottom-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-medium text-background">
          Sold out
        </span>
      )}
      <button
        type="button"
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          toggleWishlist.mutate(product.id);
        }}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-craft transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Heart className={saved ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} aria-hidden="true" />
      </button>
    </div>
  );

  const details = (
    <div className="flex flex-1 flex-col gap-2 pt-4">
      <div>
        <h3 className="font-display text-base leading-snug text-foreground">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          by {product.artisan_name ?? "IndiTribe artisan"}
        </p>
        {product.location && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {product.location}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <StarRating rating={product.rating} />
        <span>
          {product.rating.toFixed(1)} ({product.review_count})
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <span className="font-display text-lg text-foreground">{formatINR(product.price)}</span>
        {product.compare_at_price && (
          <span className="text-sm text-muted-foreground line-through">{formatINR(product.compare_at_price)}</span>
        )}
      </div>

      <Button
        size="sm"
        variant="secondary"
        className="relative z-10 mt-2 w-full sm:w-auto"
        disabled={product.stock === 0 || addToCart.isPending}
        onClick={(event) => {
          event.preventDefault();
          addToCart.mutate({ productId: product.id });
        }}
      >
        <ShoppingBag className="mr-2 h-4 w-4" aria-hidden="true" />
        {product.stock === 0 ? "Sold out" : "Add to cart"}
      </Button>
    </div>
  );

  return (
    <article
      className={`group relative flex ${
        view === "list" ? "flex-col gap-5 sm:flex-row sm:items-start" : "flex-col"
      } rounded-lg border border-border/70 bg-card p-3 shadow-craft transition-shadow hover:shadow-lift`}
    >
      <div className={view === "list" ? "sm:w-56 sm:shrink-0" : ""}>{media}</div>
      <div className={view === "list" ? "flex-1 sm:pt-0" : "flex flex-1 flex-col"}>{details}</div>
    </article>
  );
}
