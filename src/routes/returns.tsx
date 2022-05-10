import { createFileRoute } from "@tanstack/react-router";

import { InfoBlock, InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & exchanges — IndiTribe Crafts" },
      { name: "description", content: "How to return or exchange a handmade craft bought on IndiTribe Crafts." },
      { property: "og:title", content: "Returns & exchanges — IndiTribe Crafts" },
      { property: "og:description", content: "How to return or exchange a handmade craft." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Support" title="Returns & exchanges" intro="Handmade means unique — but you should still be happy with what arrives.">
      <InfoBlock heading="Return window">
        <p>Unused items in original packaging can be returned within 7 days of delivery.</p>
      </InfoBlock>
      <InfoBlock heading="What can't be returned">
        <p>Custom and made-to-order pieces, unless they arrive damaged or differ from the listing.</p>
      </InfoBlock>
      <InfoBlock heading="Handmade variation">
        <p>
          Small differences in colour, weave, grain or finish are characteristic of hand production and are not treated
          as defects. Damage in transit always is.
        </p>
      </InfoBlock>
      <InfoBlock heading="How to start a return">
        <p>Contact us with your order number and a photo. We arrange pickup where courier service is available.</p>
      </InfoBlock>
    </InfoPage>
  ),
});
