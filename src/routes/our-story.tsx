import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our story — IndiTribe Crafts" },
      {
        name: "description",
        content:
          "Why IndiTribe Crafts exists: fair pay for tribal artisans, living traditions, and crafts sold with their stories intact.",
      },
      { property: "og:title", content: "Our story — IndiTribe Crafts" },
      {
        property: "og:description",
        content: "Fair pay for tribal artisans and crafts sold with their stories intact.",
      },
    ],
  }),
  component: OurStoryPage,
});

const PILLARS = [
  {
    title: "Direct to the maker",
    body: "Every order reaches the artisan who made the piece. No middlemen quietly taking the margin that should be theirs.",
  },
  {
    title: "Fair, transparent pay",
    body: "Artisans set their own prices. We keep a small platform fee and publish it plainly to every seller.",
  },
  {
    title: "Traditions kept alive",
    body: "Warli painting, Dhokra casting, Toda embroidery, bamboo weaving — crafts survive when they earn a living.",
  },
  {
    title: "Stories travel with the craft",
    body: "Each listing carries the maker's name, village, materials and method, so nothing arrives anonymous.",
  },
];

function OurStoryPage() {
  return (
    <div>
      <section className="bg-clay py-16 text-background">
        <div className="container-craft max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-saffron">Our story</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Crafts carry more than form. They carry memory.</h1>
          <p className="mt-5 text-lg text-background/85">
            IndiTribe Crafts began with a simple imbalance: the people who hold India's tribal craft traditions rarely
            hold the profit from them. We built a marketplace where the maker's name comes first.
          </p>
        </div>
      </section>

      <section className="container-craft grid gap-10 py-16 lg:grid-cols-2">
        <img
          src="/images/story-craft.jpg"
          alt="A tribal artisan shaping clay by hand in a village workshop"
          loading="lazy"
          className="rounded-lg object-cover shadow-craft"
        />
        <div className="space-y-4 text-muted-foreground">
          <h2 className="font-display text-3xl text-foreground">What we do differently</h2>
          <p>
            We verify each artisan or collective before they sell, help them photograph and describe their work, and
            handle payment and delivery so they can stay at the loom, the kiln or the anvil.
          </p>
          <p>
            Nothing on IndiTribe is mass-produced. Small variations in a weave, a casting or a brushstroke are proof of a
            human hand, not a flaw.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link to="/shop">Shop the collection</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/artisans">Meet the artisans</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-16">
        <div className="container-craft">
          <h2 className="font-display text-3xl text-foreground">What we stand for</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="rounded-lg border border-border/70 bg-card p-6 shadow-craft">
                <h3 className="font-display text-xl">{pillar.title}</h3>
                <p className="mt-2 text-muted-foreground">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
