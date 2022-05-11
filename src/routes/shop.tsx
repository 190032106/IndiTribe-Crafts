import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Grid3x3, List, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/shop/ProductCard";
import { StarRating } from "@/components/shop/StarRating";
import { catalogQueryOptions } from "@/lib/catalog.functions";

type ShopSearch = {
  q?: string | undefined;
  category?: string | undefined;
  region?: string | undefined;
  artisan?: string | undefined;
  sort?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    region: typeof search["region"] === "string" ? search["region"] : undefined,
    artisan: typeof search["artisan"] === "string" ? search["artisan"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  head: () => ({
    meta: [
      { title: "Shop Handmade Tribal Crafts — IndiTribe Crafts" },
      {
        name: "description",
        content:
          "Browse handmade tribal crafts by category, region and artisan: Dhokra brass, Warli art, handloom textiles, terracotta, jewellery and more.",
      },
      { property: "og:title", content: "Shop Handmade Tribal Crafts — IndiTribe Crafts" },
      { property: "og:description", content: "Filter authentic tribal crafts by category, region, artisan and price." },
    ],
  }),
  pendingComponent: ShopSkeleton,
  component: ShopPage,
});

const PAGE_SIZE = 9;

function ShopPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(6000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [term, setTerm] = useState(search.q ?? "");

  const filtered = useMemo(() => {
    const query = (search.q ?? "").trim().toLowerCase();
    let list = data.products.filter((product) => {
      if (query) {
        const haystack = `${product.name} ${product.artisan_name ?? ""} ${product.region_name ?? ""} ${product.category_name ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (search.category && product.category_name) {
        const slug = data.categories.find((c) => c.slug === search.category)?.name;
        if (slug && product.category_name !== slug) return false;
      }
      if (search.region) {
        const regionName = data.regions.find((r) => r.slug === search.region)?.name;
        if (regionName && product.region_name !== regionName) return false;
      }
      if (search.artisan && product.artisan_slug !== search.artisan) return false;
      if (product.price > maxPrice) return false;
      if (product.rating < minRating) return false;
      if (inStockOnly && product.stock === 0) return false;
      return true;
    });

    switch (search.sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        break;
      default:
        break;
    }
    return list;
  }, [data, search, maxPrice, minRating, inStockOnly]);

  function setSearch(patch: Partial<ShopSearch>) {
    setVisible(PAGE_SIZE);
    navigate({ search: (previous) => ({ ...previous, ...patch }) });
  }

  const shown = filtered.slice(0, visible);

  return (
    <div className="container-craft py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl text-foreground">Shop all crafts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {data.products.length} handmade pieces from {data.artisans.length} artisan partners across India.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`} aria-label="Product filters">
          <div className="space-y-7 rounded-lg border border-border/70 bg-card p-5 shadow-craft">
            <div>
              <Label htmlFor="shop-search">Search</Label>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearch({ q: term || undefined });
                }}
              >
                <Input
                  id="shop-search"
                  value={term}
                  maxLength={120}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Search crafts"
                />
                <Button type="submit" size="sm">
                  Go
                </Button>
              </form>
            </div>

            <FilterGroup label="Category">
              <FilterList
                options={[{ value: undefined, label: "All categories" }, ...data.categories.map((c) => ({ value: c.slug, label: `${c.name} (${c.product_count})` }))]}
                active={search.category}
                onSelect={(value) => setSearch({ category: value })}
              />
            </FilterGroup>

            <FilterGroup label="Region">
              <FilterList
                options={[{ value: undefined, label: "All regions" }, ...data.regions.map((r) => ({ value: r.slug, label: r.name }))]}
                active={search.region}
                onSelect={(value) => setSearch({ region: value })}
              />
            </FilterGroup>

            <FilterGroup label="Artisan">
              <FilterList
                options={[{ value: undefined, label: "All artisans" }, ...data.artisans.map((a) => ({ value: a.slug, label: a.display_name }))]}
                active={search.artisan}
                onSelect={(value) => setSearch({ artisan: value })}
              />
            </FilterGroup>

            <FilterGroup label={`Price up to ₹${maxPrice.toLocaleString("en-IN")}`}>
              <Slider
                value={[maxPrice]}
                min={500}
                max={6000}
                step={100}
                onValueChange={([value]) => {
                  setMaxPrice(value ?? 6000);
                  setVisible(PAGE_SIZE);
                }}
                aria-label="Maximum price"
              />
            </FilterGroup>

            <FilterGroup label="Rating">
              <div className="space-y-2">
                {[0, 4, 4.5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMinRating(value)}
                    aria-pressed={minRating === value}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                      minRating === value ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {value === 0 ? "Any rating" : <>{value}+ <StarRating rating={5} size={12} /></>}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <div className="flex items-center gap-2">
              <Checkbox
                id="in-stock"
                checked={inStockOnly}
                onCheckedChange={(checked) => setInStockOnly(checked === true)}
              />
              <Label htmlFor="in-stock" className="text-sm font-normal">
                In stock only
              </Label>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setTerm("");
                setMaxPrice(6000);
                setMinRating(0);
                setInStockOnly(false);
                navigate({ search: {} });
              }}
            >
              Clear all filters
            </Button>
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen((open) => !open)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {filtersOpen ? "Hide filters" : "Filters"}
            </Button>
            <p className="text-sm text-muted-foreground">{filtered.length} products</p>
            <div className="flex items-center gap-2">
              <Select value={search.sort ?? "featured"} onValueChange={(value) => setSearch({ sort: value })}>
                <SelectTrigger className="w-[180px]" aria-label="Sort products">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Best Rated</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden rounded-md border border-border sm:flex">
                <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" aria-label="Grid view" onClick={() => setView("grid")}>
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" aria-label="List view" onClick={() => setView("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <h2 className="font-display text-xl text-foreground">No crafts match those filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your price range or clearing a filter.
              </p>
              <Button className="mt-5" variant="outline" asChild>
                <Link to="/shop" search={{}}>
                  Reset filters
                </Link>
              </Button>
            </div>
          ) : (
            <div className={view === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-5"}>
              {shown.map((product) => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          )}

          {visible < filtered.length && (
            <div className="mt-10 text-center">
              <Button variant="outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                Load more crafts
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</h2>
      {children}
    </div>
  );
}

function FilterList({
  options,
  active,
  onSelect,
}: {
  options: { value: string | undefined; label: string }[];
  active?: string | undefined;
  onSelect: (value: string | undefined) => void;
}) {
  return (
    <ul className="max-h-52 space-y-1 overflow-y-auto pr-1">
      {options.map((option) => (
        <li key={option.label}>
          <button
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={active === option.value}
            className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              active === option.value ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ShopSkeleton() {
  return (
    <div className="container-craft grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
