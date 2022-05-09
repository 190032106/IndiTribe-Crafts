import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, HandHeart, Hammer, Landmark, Sparkles } from "lucide-react";
import { toast } from "sonner";

import heroImage from "@/assets/hero-crafts.jpg";
import storyImage from "@/assets/story-craft.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shop/ProductCard";
import { StarRating } from "@/components/shop/StarRating";
import { homeQueryOptions } from "@/lib/catalog.functions";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQueryOptions),
  head: () => ({
    meta: [
      { title: "IndiTribe Crafts — Authentic Indian Tribal Crafts, Made by Hand" },
      {
        name: "description",
        content:
          "Shop handmade Dhokra brass, Warli paintings, handloom shawls and terracotta from tribal artisans across India. Every purchase supports the maker directly.",
      },
      { property: "og:title", content: "IndiTribe Crafts — Authentic Indian Tribal Crafts" },
      {
        property: "og:description",
        content: "Authentic tribal crafts. Stories made by hand, bought directly from Indian artisan communities.",
      },
    ],
  }),
  component: HomePage,
});

const WHY_CARDS = [
  { Icon: Sparkles, title: "Authentic Crafts", body: "Products made using traditional tribal techniques." },
  { Icon: HandHeart, title: "Support Artisans", body: "Your purchase directly supports artisan communities." },
  { Icon: Landmark, title: "Preserving Heritage", body: "Helping traditional crafts survive for future generations." },
  { Icon: Hammer, title: "Made by Hand", body: "Every piece has the character of human craftsmanship." },
];

function HomePage() {
  const { data } = useSuspenseQuery(homeQueryOptions);
  const [activeRegion, setActiveRegion] = useState(data.regions[0]?.slug ?? "");
  const [email, setEmail] = useState("");
  const region = data.regions.find((item) => item.slug === activeRegion) ?? data.regions[0];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/70 bg-secondary">
        <div className="container-craft grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Authentic tribal crafts
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Crafted by Tradition.
              <br />
              Made for Today.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              Discover authentic handmade products created by tribal artisans across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/shop">Shop Collection</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/artisans">Meet the Artisans</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { label: "Artisan partners", value: `${data.artisans.length}+` },
                { label: "Craft regions", value: `${data.regions.length}` },
                { label: "Craft categories", value: `${data.categories.length}` },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</dt>
                  <dd className="font-display text-2xl text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="motif-dots absolute -left-6 -top-6 h-32 w-32 rounded-md" aria-hidden="true" />
            <img
              src={heroImage}
              alt="Dhokra brass figurines, terracotta pots and a handwoven tribal textile arranged on natural cloth"
              width={1920}
              height={1280}
              className="relative w-full rounded-lg object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <Section
        eyebrow="Shop by category"
        title="Ten living craft traditions"
        description="From lost-wax brass to pit-loom weaving, every category is rooted in a community practice."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((category) => (
            <Link
              key={category.id}
              to="/shop"
              search={{ category: category.slug }}
              className="group overflow-hidden rounded-lg border border-border/70 bg-card shadow-craft transition-shadow hover:shadow-lift"
            >
              <img
                src={category.image_url ?? "/images/products/dhokra-figurine.jpg"}
                alt={`${category.name} crafts`}
                loading="lazy"
                width={1024}
                height={640}
                className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg text-foreground">{category.name}</h3>
                  <span className="text-xs text-muted-foreground">{category.product_count} products</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* FEATURED PRODUCTS */}
      <Section
        eyebrow="Featured"
        title="Pieces we're proud of"
        description="Each one signed by the hands that made it."
        action={{ label: "View all products", to: "/shop" }}
        muted
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>

      {/* ARTISANS */}
      <Section eyebrow="Discover the artisans" title="Every Product Has a Story." >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.artisans.map((artisan) => (
            <article key={artisan.id} className="rounded-lg border border-border/70 bg-card p-4 shadow-craft">
              <img
                src={artisan.photo_url ?? "/images/artisans/sita-devi.jpg"}
                alt={`${artisan.display_name}, ${artisan.craft_specialization ?? "artisan"}`}
                loading="lazy"
                width={800}
                height={800}
                className="aspect-square w-full rounded-md object-cover"
              />
              <h3 className="mt-4 font-display text-lg text-foreground">{artisan.display_name}</h3>
              <p className="text-sm text-primary">{artisan.community} community</p>
              <p className="mt-1 text-sm text-muted-foreground">{artisan.location}</p>
              <p className="mt-3 text-sm text-foreground/80">{artisan.craft_specialization}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {artisan.years_experience} years of practice • {artisan.product_count} products
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/artisans">
              Meet Our Artisans <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* REGIONS */}
      <Section
        eyebrow="Shop by region"
        title="Where the crafts come from"
        description="Pick a state to see its traditional craft and the pieces made there."
        muted
      >
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {data.regions.map((item) => (
              <li key={item.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setActiveRegion(item.slug)}
                  aria-pressed={item.slug === activeRegion}
                  className={`w-full rounded-md border px-4 py-2.5 text-left text-sm transition-colors ${
                    item.slug === activeRegion
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>

          {region && (
            <div className="rounded-lg border border-border/70 bg-card p-6 shadow-craft">
              <h3 className="font-display text-2xl text-foreground">{region.name}</h3>
              <p className="mt-1 text-sm uppercase tracking-wide text-primary">{region.traditional_craft}</p>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{region.description}</p>

              {region.sample_products.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {region.sample_products.map((product) => (
                    <Link
                      key={product.slug}
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="group rounded-md border border-border/70 p-2"
                    >
                      <img
                        src={product.image_url ?? "/images/products/terracotta-set.jpg"}
                        alt={product.name}
                        loading="lazy"
                        width={1024}
                        height={1024}
                        className="aspect-square w-full rounded-sm object-cover"
                      />
                      <p className="mt-2 text-sm text-foreground group-hover:text-primary">{product.name}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                  New artisans from {region.name} are joining soon. Follow along for their first collection.
                </p>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* WHY */}
      <Section eyebrow="Why IndiTribe Crafts" title="A marketplace built around the maker">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CARDS.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-lg border border-border/70 bg-card p-6 shadow-craft">
              <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CULTURAL STORY */}
      <section className="bg-clay py-16 text-background">
        <div className="container-craft grid items-center gap-10 lg:grid-cols-2">
          <img
            src={storyImage}
            alt="A tribal potter shaping clay on a hand-turned wheel in her village workshop"
            loading="lazy"
            width={1600}
            height={1104}
            className="w-full rounded-lg object-cover shadow-lift"
          />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-saffron">Cultural story</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">More Than a Product</h2>
            <p className="mt-4 text-base text-background/80">
              Long before craft became commerce, these objects were made for ritual and for daily life — a pot for
              storing the harvest, a shawl gifted at a wedding, a brass figure placed in a household shrine. The motifs
              are not decoration; they are a language of seasons, ancestors and forest.
            </p>
            <p className="mt-3 text-base text-background/80">
              As younger generations move away from craft villages, these languages fall silent. IndiTribe Crafts exists
              so the makers can earn a fair, direct living from the traditions they inherited — and so the next
              generation has a reason to learn them.
            </p>
            <Button variant="secondary" className="mt-7" asChild>
              <Link to="/our-story">Explore Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <Section eyebrow="Customer reviews" title="What collectors say">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.testimonials.map((review) => (
            <figure key={review.id} className="rounded-lg border border-border/70 bg-card p-6 shadow-craft">
              <StarRating rating={review.rating} />
              <blockquote className="mt-3 text-sm text-foreground/85">"{review.comment}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-display text-sm text-foreground">
                  {review.author_name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{review.author_name}</span>
                  <span className="block text-xs text-muted-foreground">Bought {review.product_name}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* NEWSLETTER */}
      <section className="border-y border-border/70 bg-secondary py-16">
        <div className="container-craft max-w-2xl text-center">
          <h2 className="font-display text-3xl text-foreground">Stories, Crafts & New Collections</h2>
          <p className="mt-3 text-muted-foreground">
            Join our community and discover new artisan collections, stories and exclusive offers.
          </p>
          <form
            className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                toast.error("Please enter a valid email address");
                return;
              }
              setEmail("");
              toast.success("You're on the list. Look out for our next artisan story.");
            }}
          >
            <Input
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="bg-card"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </section>
    </>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
  action,
  muted = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: { label: string; to: "/shop" };
  muted?: boolean;
}) {
  return (
    <section className={muted ? "bg-secondary/60 py-16" : "py-16"}>
      <div className="container-craft">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">{title}</h2>
            {description && <p className="mt-2 max-w-xl text-muted-foreground">{description}</p>}
          </div>
          {action && (
            <Button variant="ghost" asChild>
              <Link to={action.to}>
                {action.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
