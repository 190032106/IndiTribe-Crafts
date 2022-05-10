import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { catalogQueryOptions } from "@/lib/catalog.functions";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  head: () => ({
    meta: [
      { title: "Craft categories — IndiTribe Crafts" },
      {
        name: "description",
        content: "Browse tribal handicrafts by category: paintings, metal craft, textiles, pottery, jewellery and more.",
      },
      { property: "og:title", content: "Craft categories — IndiTribe Crafts" },
      { property: "og:description", content: "Browse authentic tribal handicrafts by craft category." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions);

  return (
    <div className="container-craft py-14">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Browse</p>
      <h1 className="mt-3 font-display text-4xl text-foreground">Craft categories</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Each category holds a distinct tradition — a technique passed between generations rather than a product line.
      </p>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.categories.map((category) => (
          <li key={category.id}>
            <Link
              to="/shop"
              search={{ category: category.slug }}
              className="group block overflow-hidden rounded-lg border border-border/70 bg-card shadow-craft transition-shadow hover:shadow-craft-lg"
            >
              <div className="motif-dots aspect-[4/3] w-full bg-secondary">
                {category.image_url && (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl group-hover:text-primary">{category.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                  {category.product_count} piece{category.product_count === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
