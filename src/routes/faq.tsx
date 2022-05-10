import { createFileRoute } from "@tanstack/react-router";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently asked questions — IndiTribe Crafts" },
      { name: "description", content: "Answers about authenticity, delivery, returns, payments and selling on IndiTribe Crafts." },
      { property: "og:title", content: "FAQ — IndiTribe Crafts" },
      { property: "og:description", content: "Answers about authenticity, delivery, returns and payments." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "Is everything really handmade?",
    a: "Yes. Every artisan is verified before listing and each piece is made by hand, so small variations between items are normal and expected.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery is 5 to 8 working days across India. Express delivery arrives in 2 to 3 working days. Made-to-order pieces mention their crafting time on the product page.",
  },
  {
    q: "Do artisans really get paid directly?",
    a: "Yes. Artisans set their own prices and receive the payout for each order after delivery, minus a small, clearly published platform fee.",
  },
  {
    q: "Can I return a craft?",
    a: "You can return an unused item within 7 days of delivery. Custom or made-to-order pieces are not returnable unless they arrive damaged.",
  },
  {
    q: "Which payment methods work?",
    a: "Card and UPI payments are being connected. Right now orders are placed in demo mode so you can complete checkout end to end.",
  },
  {
    q: "How do I sell my craft here?",
    a: "Apply through the Sell page. Our artisan team verifies your work, then helps you photograph and list your first pieces.",
  },
];

function FaqPage() {
  return (
    <InfoPage eyebrow="Help" title="Frequently asked questions" intro="The things buyers and artisans ask us most.">
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left font-display text-lg">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </InfoPage>
  );
}
