import { createFileRoute } from "@tanstack/react-router";

import { InfoBlock, InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/seller-guidelines")({
  head: () => ({
    meta: [
      { title: "Seller guidelines — IndiTribe Crafts" },
      { name: "description", content: "What IndiTribe Crafts expects from artisans: authenticity, honest listings, fair pricing and timely dispatch." },
      { property: "og:title", content: "Seller guidelines — IndiTribe Crafts" },
      { property: "og:description", content: "What we expect from artisans selling on IndiTribe Crafts." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="For artisans" title="Seller guidelines" intro="Simple standards that keep buyer trust high for every artisan on the platform.">
      <InfoBlock heading="Authenticity">
        <p>Only handmade work by you or your collective may be listed. Factory-made or resold goods are removed.</p>
      </InfoBlock>
      <InfoBlock heading="Honest listings">
        <p>Describe materials, size and technique accurately, and photograph the actual piece being sold.</p>
      </InfoBlock>
      <InfoBlock heading="Pricing and payouts">
        <p>You set your own prices. IndiTribe keeps a small platform fee, published in your seller agreement, and pays out after delivery.</p>
      </InfoBlock>
      <InfoBlock heading="Dispatch">
        <p>Ready-made pieces should be dispatched within 3 working days. Made-to-order crafting time must be stated on the listing.</p>
      </InfoBlock>
      <InfoBlock heading="Respecting tradition">
        <p>Credit your community and craft tradition accurately; never claim a technique or motif that isn't yours to sell.</p>
      </InfoBlock>
    </InfoPage>
  ),
});
