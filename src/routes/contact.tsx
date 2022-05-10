import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — IndiTribe Crafts" },
      { name: "description", content: "Questions about an order, a craft or selling with IndiTribe? Get in touch." },
      { property: "og:title", content: "Contact us — IndiTribe Crafts" },
      { property: "og:description", content: "Questions about an order or selling with IndiTribe? Get in touch." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setForm({ name: "", email: "", message: "" });
    toast.success("Thanks — we'll reply within two working days.");
  }

  return (
    <InfoPage
      eyebrow="Contact"
      title="We'd love to hear from you"
      intro="Order questions, craft enquiries, wholesale or press — send a note and a real person will reply."
    >
      <p className="text-muted-foreground">
        Support hours are Monday to Saturday, 10am to 6pm IST. Please add your order number if your question is about a
        delivery.
      </p>
      <form onSubmit={submit} className="space-y-4 rounded-lg border border-border/70 bg-card p-6 shadow-craft">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" className="mt-2" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" className="mt-2" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="contact-message">Message</Label>
          <Textarea id="contact-message" rows={5} className="mt-2" maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <Button type="submit">Send message</Button>
      </form>
    </InfoPage>
  );
}
