import { createFileRoute } from "@tanstack/react-router";

import { InfoBlock, InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — IndiTribe Crafts" },
      { name: "description", content: "The terms that apply when you shop or sell on the IndiTribe Crafts marketplace." },
      { property: "og:title", content: "Terms of service — IndiTribe Crafts" },
      { property: "og:description", content: "The terms that apply when you shop or sell on IndiTribe Crafts." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Policies" title="Terms of service" intro="The agreement between you and IndiTribe Crafts.">
      <InfoBlock heading="Using the marketplace">
        <p>You must give accurate account details and use the site lawfully. Accounts may be suspended for misuse or fraud.</p>
      </InfoBlock>
      <InfoBlock heading="Orders">
        <p>An order is confirmed once payment is recorded. Prices are in Indian rupees and include applicable taxes as shown at checkout.</p>
      </InfoBlock>
      <InfoBlock heading="Artisans and listings">
        <p>Sellers are responsible for the accuracy of their listings and confirm their goods are genuinely handmade.</p>
      </InfoBlock>
      <InfoBlock heading="Content and imagery">
        <p>Product photographs, craft stories and artisan portraits remain the property of IndiTribe Crafts and its artisans.</p>
      </InfoBlock>
    </InfoPage>
  ),
});
