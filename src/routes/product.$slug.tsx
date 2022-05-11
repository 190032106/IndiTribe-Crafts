import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/shop/StarRating";
import { ProductCard } from "@/components/shop/ProductCard";
import { formatINR, discountPercent } from "@/lib/format";
import { productQueryOptions } from "@/lib/catalog.functions";
import { useAddToCart, useToggleWishlist, useWishlist } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQueryOptions(params.slug));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable — IndiTribe Crafts" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — IndiTribe Crafts`;
    const description =
      loaderData.description ?? "Handmade tribal craft from an IndiTribe Crafts artisan partner in India.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  pendingComponent: () => (
    <div className="container-craft grid gap-10 py-10 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-craft py-24 text-center">
      <h1 className="font-display text-3xl">We couldn't find that craft</h1>
      <Button className="mt-6" asChild>
        <Link to="/shop">Back to the shop</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQueryOptions(slug));
  const product = data!;
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);

  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();
  const saved = wishlist?.some((item) => item.product_id === product.id) ?? false;
  const discount = discountPercent(product.price, product.compare_at_price);
  const images = product.images.length > 0 ? product.images : [{ image_url: "/images/products/warli-wall-art.jpg", alt_text: product.name }];

  return (
    <div className="container-craft py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <button
            type="button"
            onClick={() => setZoom((value) => !value)}
            aria-label={zoom ? "Zoom out of product image" : "Zoom into product image"}
            className="block w-full overflow-hidden rounded-lg border border-border/70 bg-secondary"
          >
            <img
              src={images[activeImage]?.image_url}
              alt={images[activeImage]?.alt_text ?? product.name}
              width={1024}
              height={1024}
              className={`aspect-square w-full object-cover transition-transform duration-500 ${zoom ? "scale-150" : "scale-100"}`}
            />
          </button>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image.image_url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={`h-20 w-20 overflow-hidden rounded-md border-2 ${index === activeImage ? "border-primary" : "border-border"}`}
                >
                  <img src={image.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <StarRating rating={product.rating} />
            <span>
              {product.rating.toFixed(1)} · {product.review_count} reviews
            </span>
            <span>·</span>
            <span>
              by{" "}
              <Link to="/artisans" className="text-primary hover:underline">
                {product.artisan_name}
              </Link>
              , {product.location}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl text-foreground">{formatINR(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through">{formatINR(product.compare_at_price)}</span>
            )}
            {discount && (
              <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                Save {discount}%
              </span>
            )}
          </div>

          <p className="mt-4 text-muted-foreground">{product.description}</p>

          <p className={`mt-5 text-sm ${product.stock > 0 ? "text-forest" : "text-destructive"}`}>
            {product.stock > 0 ? `In stock — ${product.stock} available` : "Currently sold out"}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <Button variant="ghost" size="icon" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm" aria-live="polite">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              disabled={product.stock === 0 || addToCart.isPending}
              onClick={() => addToCart.mutate({ productId: product.id, quantity })}
            >
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              disabled={product.stock === 0}
              onClick={() =>
                addToCart.mutate(
                  { productId: product.id, quantity },
                  { onSuccess: () => window.location.assign("/checkout") },
                )
              }
            >
              Buy Now
            </Button>
            <Button variant="outline" size="icon" aria-label="Save to wishlist" onClick={() => toggleWishlist.mutate(product.id)}>
              <Heart className={saved ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
            </Button>
          </div>

          <ul className="mt-8 space-y-3 rounded-lg border border-border/70 bg-card p-5 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" /> Delivered in 5–8 working days across India.
              Free shipping over ₹2,500 (otherwise ₹99).
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 text-primary" aria-hidden="true" /> 7-day returns for damaged or incorrect
              items.
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Artisan verified by the IndiTribe
              team.
            </li>
          </ul>
        </div>
      </div>

      {/* STORY */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-foreground">Product story</h2>
          <p className="mt-4 text-muted-foreground">{product.craft_story}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <StoryRow label="Materials" value={product.materials} />
            <StoryRow label="Production method" value={product.production_method} />
            <StoryRow label="Region" value={product.region_name} />
            <StoryRow label="Cultural significance" value={product.cultural_significance} />
          </dl>
        </div>

        {product.artisan && (
          <div className="rounded-lg border border-border/70 bg-card p-6 shadow-craft">
            <h2 className="font-display text-2xl text-foreground">About the artisan</h2>
            <div className="mt-5 flex gap-4">
              <img
                src={product.artisan.photo_url ?? "/images/artisans/sita-devi.jpg"}
                alt={product.artisan.display_name}
                loading="lazy"
                width={800}
                height={800}
                className="h-24 w-24 rounded-md object-cover"
              />
              <div>
                <p className="font-display text-lg text-foreground">{product.artisan.display_name}</p>
                <p className="text-sm text-primary">{product.artisan.community} community</p>
                <p className="text-sm text-muted-foreground">{product.artisan.location}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.artisan.craft_specialization} · {product.artisan.years_experience} years
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{product.artisan.biography}</p>
          </div>
        )}
      </section>

      <ReviewsSection productId={product.id} slug={slug} reviews={product.reviews} />

      {product.related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-foreground">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StoryRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 border-b border-border/60 pb-3 sm:grid-cols-[160px_1fr]">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-foreground/85">{value}</dd>
    </div>
  );
}

function ReviewsSection({
  productId,
  slug,
  reviews,
}: {
  productId: string;
  slug: string;
  reviews: { id: string; author_name: string; rating: number; comment: string | null; photo_url: string | null; created_at: string }[];
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!user) {
      toast.error("Please sign in to write a review");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      author_name: (user.user_metadata?.["full_name"] as string) ?? user.email?.split("@")[0] ?? "IndiTribe customer",
      rating,
      comment: comment.trim().slice(0, 1000),
      photo_url: photoUrl.trim() ? photoUrl.trim().slice(0, 500) : null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not save your review. Please try again.");
      return;
    }
    setComment("");
    setPhotoUrl("");
    toast.success("Thank you — your review is published");
    queryClient.invalidateQueries({ queryKey: ["product", slug] });
  }

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl text-foreground">Reviews</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {reviews.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
              No reviews yet. Be the first to share how this piece looks in your home.
            </p>
          )}
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-border/70 bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-display text-sm">
                  {review.author_name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{review.author_name}</p>
                  <StarRating rating={review.rating} size={12} />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
              {review.photo_url && (
                <img src={review.photo_url} alt="" loading="lazy" className="mt-3 h-28 w-28 rounded-md object-cover" />
              )}
            </article>
          ))}
        </div>

        <form onSubmit={submitReview} className="h-fit rounded-lg border border-border/70 bg-card p-5">
          <h3 className="font-display text-lg text-foreground">Write a review</h3>
          <div className="mt-4">
            <Label>Your rating</Label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  className="rounded-sm p-0.5"
                >
                  <StarRating rating={value <= rating ? 5 : 0} size={18} />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="review-comment">Your review</Label>
            <Textarea
              id="review-comment"
              value={comment}
              maxLength={1000}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What did you think of the craftsmanship?"
              className="mt-2"
              rows={4}
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="review-photo">Photo link (optional)</Label>
            <Input
              id="review-photo"
              value={photoUrl}
              maxLength={500}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="https://…"
              className="mt-2"
            />
          </div>
          <Button type="submit" className="mt-5 w-full" disabled={submitting}>
            {submitting ? "Publishing…" : "Publish review"}
          </Button>
          {!user && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              <Link to="/auth" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
