import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { catalogQueryOptions } from "@/lib/catalog.functions";

export const Route = createFileRoute("/artisans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  head: () => ({
    meta: [
      { title: "Meet the artisans — IndiTribe Crafts" },
      {
        name: "description",
        content:
          "The tribal artisans and collectives behind every IndiTribe piece — their communities, crafts and years at the trade.",
      },
      { property: "og:title", content: "Meet the artisans — IndiTribe Crafts" },
      { property: "og:description", content: "The tribal makers behind every IndiTribe piece." },
    ],
  }),
  component: ArtisansPage,
});

function ArtisansPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions);

  return (
    <div className="container-craft py-14">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary">The makers</p>
      <h1 className="mt-3 font-display text-4xl text-foreground">Meet the artisans</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Every piece on IndiTribe is signed by a person, not a factory. These are the hands behind the collection.
      </p>

      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {data.artisans.map((artisan) => (
          <li key={artisan.id} className="flex gap-5 rounded-lg border border-border/70 bg-card p-5 shadow-craft">
            <img
              src={artisan.photo_url ?? "/images/artisans/sita-devi.jpg"}
              alt={artisan.display_name}
              loading="lazy"
              className="h-28 w-28 shrink-0 rounded-md object-cover"
            />
            <div>
              <h2 className="font-display text-xl">{artisan.display_name}</h2>
              <p className="text-sm text-muted-foreground">
                {artisan.community ? `${artisan.community} community · ` : ""}
                {artisan.location}
              </p>
              <p className="mt-1 text-sm text-primary">{artisan.craft_specialization}</p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{artisan.biography}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{artisan.years_experience} years at the craft</span>
                <span aria-hidden="true">·</span>
                <span>{artisan.product_count} pieces listed</span>
              </div>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/shop" search={{ artisan: artisan.slug }}>
                  Shop their work
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="motif-band mt-14 rounded-lg bg-clay p-8 text-center text-background">
        <h2 className="font-display text-2xl">Are you an artisan?</h2>
        <p className="mx-auto mt-2 max-w-xl text-background/85">
          Join IndiTribe and sell directly to buyers who care where their crafts come from.
        </p>
        <Button variant="secondary" className="mt-5" asChild>
          <Link to="/sell">Become a seller</Link>
        </Button>
      </div>
    </div>
  );
}
