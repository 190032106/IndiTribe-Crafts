import { createFileRoute } from "@tanstack/react-router";

import { InfoBlock, InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — IndiTribe Crafts" },
      { name: "description", content: "What personal data IndiTribe Crafts collects, why, and how it is protected." },
      { property: "og:title", content: "Privacy policy — IndiTribe Crafts" },
      { property: "og:description", content: "What data we collect, why, and how it is protected." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Policies" title="Privacy policy" intro="We collect the least we can and never sell your data.">
      <InfoBlock heading="What we collect">
        <p>Your name, email, phone and delivery address, plus your orders, saved items and reviews.</p>
      </InfoBlock>
      <InfoBlock heading="Why">
        <p>To take payment, deliver your order, answer support questions and show you your own history.</p>
      </InfoBlock>
      <InfoBlock heading="Who sees it">
        <p>Artisans see the delivery details needed to ship your order. Couriers see the address. Nobody else.</p>
      </InfoBlock>
      <InfoBlock heading="Your choices">
        <p>You can edit your details in your account, unsubscribe from emails at any time, or ask us to delete your account.</p>
      </InfoBlock>
    </InfoPage>
  ),
});
