import { createFileRoute } from "@tanstack/react-router";

import { InfoBlock, InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping information — IndiTribe Crafts" },
      { name: "description", content: "Delivery times, charges and packaging for handmade tribal crafts shipped across India." },
      { property: "og:title", content: "Shipping information — IndiTribe Crafts" },
      { property: "og:description", content: "Delivery times, charges and packaging for handmade crafts." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Support" title="Shipping information" intro="How your craft travels from the artisan's village to your door.">
      <InfoBlock heading="Delivery times">
        <p>Standard delivery: 5 to 8 working days anywhere in India.</p>
        <p>Express delivery: 2 to 3 working days for an added ₹199.</p>
        <p>Made-to-order pieces list their crafting time on the product page, added before dispatch.</p>
      </InfoBlock>
      <InfoBlock heading="Charges">
        <p>Standard shipping is ₹99, and free on orders above ₹2,500.</p>
      </InfoBlock>
      <InfoBlock heading="Packaging">
        <p>
          Fragile crafts such as terracotta and Dhokra metalwork are packed with recycled cushioning and shipped in
          double-walled cartons. We avoid plastic wherever the craft allows.
        </p>
      </InfoBlock>
      <InfoBlock heading="Tracking">
        <p>You'll receive a tracking link by email once your order is dispatched, and can follow it from your account.</p>
      </InfoBlock>
    </InfoPage>
  ),
});
