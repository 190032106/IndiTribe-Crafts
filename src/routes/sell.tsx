import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell your craft — IndiTribe Crafts" },
      {
        name: "description",
        content:
          "Tribal artisans and collectives can apply to sell handmade crafts directly to buyers on IndiTribe Crafts.",
      },
      { property: "og:title", content: "Sell your craft — IndiTribe Crafts" },
      { property: "og:description", content: "Apply to sell your handmade tribal craft directly to buyers." },
    ],
  }),
  component: SellPage,
});

const applicationSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your name or collective name").max(100),
  community: z.string().trim().max(80),
  location: z.string().trim().min(2, "Enter your village, district and state").max(120),
  craft: z.string().trim().min(2, "Tell us your craft").max(120),
  years: z.coerce.number().int().min(0).max(90),
  biography: z.string().trim().min(30, "Tell us a little more about your work").max(2000),
});

const STEPS = [
  { title: "Apply", body: "Share who you are, your community and the craft you practise." },
  { title: "We verify", body: "Our team calls you to confirm your work is genuinely handmade." },
  { title: "List your pieces", body: "We help photograph and describe each product with its story." },
  { title: "Get paid", body: "Orders reach you directly; payouts are made after delivery." },
];

function SellPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ displayName: "", community: "", location: "", craft: "", years: "0", biography: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) {
      toast.error("Please sign in first so we can link your application to your account.");
      return;
    }
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSubmitting(true);
    const slug = `${parsed.data.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()
      .toString(36)
      .slice(-4)}`;

    const { error } = await supabase.from("artisans").insert({
      user_id: user.id,
      slug,
      display_name: parsed.data.displayName,
      community: parsed.data.community || null,
      location: parsed.data.location,
      craft_specialization: parsed.data.craft,
      years_experience: parsed.data.years,
      biography: parsed.data.biography,
      status: "pending",
    });
    setSubmitting(false);

    if (error) {
      toast.error("We couldn't submit your application. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Application received");
  }

  return (
    <div>
      <section className="bg-clay py-16 text-background">
        <div className="container-craft max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-saffron">For artisans</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Sell your craft. Keep your name on it.</h1>
          <p className="mt-5 text-lg text-background/85">
            IndiTribe connects tribal artisans directly with buyers across India and beyond. You set your prices; we
            handle the shop.
          </p>
        </div>
      </section>

      <section className="container-craft py-14">
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-lg border border-border/70 bg-card p-6 shadow-craft">
              <span className="font-display text-3xl text-primary">{index + 1}</span>
              <h2 className="mt-2 font-display text-xl">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-craft max-w-2xl pb-20">
        {submitted ? (
          <div className="rounded-lg border border-border/70 bg-card p-10 text-center shadow-craft">
            <h2 className="font-display text-2xl">Thank you — we've got your application</h2>
            <p className="mt-3 text-muted-foreground">
              Our artisan team reviews new applications within a few working days and will contact you on the details in
              your account.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/account">Go to my account</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border/70 bg-card p-8 shadow-craft">
            <h2 className="font-display text-2xl">Artisan application</h2>
            {!user && (
              <p className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                Please{" "}
                <Link to="/auth" className="font-medium text-primary hover:underline">
                  sign in or create an account
                </Link>{" "}
                before applying.
              </p>
            )}
            <Field id="sell-name" label="Your name or collective">
              <Input id="sell-name" maxLength={100} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="sell-community" label="Community (optional)">
                <Input id="sell-community" maxLength={80} value={form.community} onChange={(e) => setForm({ ...form, community: e.target.value })} />
              </Field>
              <Field id="sell-location" label="Village, district and state">
                <Input id="sell-location" maxLength={120} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="sell-craft" label="Your craft">
                <Input id="sell-craft" maxLength={120} value={form.craft} onChange={(e) => setForm({ ...form, craft: e.target.value })} />
              </Field>
              <Field id="sell-years" label="Years of experience">
                <Input id="sell-years" type="number" min={0} max={90} value={form.years} onChange={(e) => setForm({ ...form, years: e.target.value })} />
              </Field>
            </div>
            <Field id="sell-bio" label="Tell us about your work">
              <Textarea id="sell-bio" rows={5} maxLength={2000} value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
            </Field>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
            <p className="text-xs text-muted-foreground">
              By applying you agree to our{" "}
              <Link to="/seller-guidelines" className="text-primary hover:underline">
                seller guidelines
              </Link>
              .
            </p>
          </form>
        )}
      </section>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
