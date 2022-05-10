import { createFileRoute } from "@tanstack/react-router";

import { InfoBlock, InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund policy — IndiTribe Crafts" },
      { name: "description", content: "When and how IndiTribe Crafts issues refunds for returned or undelivered orders." },
      { property: "og:title", content: "Refund policy — IndiTribe Crafts" },
      { property: "og:description", content: "When and how refunds are issued for returned or undelivered orders." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Policies" title="Refund policy" intro="Plain terms on when money comes back to you.">
      <InfoBlock heading="Approved returns">
        <p>Once a returned item reaches the artisan and passes a condition check, the refund is issued within 7 working days.</p>
      </InfoBlock>
      <InfoBlock heading="Damaged or wrong items">
        <p>A full refund, including shipping, is issued when a piece arrives damaged or does not match its listing.</p>
      </InfoBlock>
      <InfoBlock heading="Cancellations">
        <p>Orders can be cancelled free of charge before dispatch. Made-to-order pieces can be cancelled within 24 hours.</p>
      </InfoBlock>
      <InfoBlock heading="Method">
        <p>Refunds return to the original payment method. Payment processing is in demo mode while a provider is being connected.</p>
      </InfoBlock>
    </InfoPage>
  ),
});
