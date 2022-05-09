import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { cartTotals } from "@/routes/cart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — IndiTribe Crafts" },
      { name: "description", content: "Complete your IndiTribe Crafts order in a few simple steps." },
      { property: "og:title", content: "Checkout — IndiTribe Crafts" },
      { property: "og:description", content: "Complete your handmade craft order securely." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Contact", "Shipping address", "Delivery", "Payment", "Confirmation"] as const;

const contactSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(20),
});

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(100),
  line1: z.string().trim().min(4, "Enter the street address").max(200),
  line2: z.string().trim().max(200),
  city: z.string().trim().min(2, "Enter a city").max(80),
  state: z.string().trim().min(2, "Enter a state").max(80),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { data: lines } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [address, setAddress] = useState({ fullName: "", line1: "", line2: "", city: "", state: "", postalCode: "" });
  const [delivery, setDelivery] = useState("standard");
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const subtotal = lines?.reduce((total, line) => total + line.price * line.quantity, 0) ?? 0;
  const base = cartTotals(subtotal);
  const expressFee = delivery === "express" ? 199 : 0;
  const total = base.total + expressFee;

  if (!loading && !user) {
    return (
      <Notice title="Sign in to check out" body="Your bag and orders live in your account." to="/auth" label="Sign in" />
    );
  }

  if (step < 4 && (!lines || lines.length === 0)) {
    return <Notice title="Your bag is empty" body="Add a craft before checking out." to="/shop" label="Shop crafts" />;
  }

  async function placeOrder() {
    if (!user || !lines) return;
    setPlacing(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "processing",
        subtotal,
        shipping_fee: base.shipping + expressFee,
        tax: base.tax,
        discount: 0,
        total,
        contact_email: contact.email,
        contact_phone: contact.phone,
        delivery_method: delivery === "express" ? "Express (2–3 days)" : "Standard (5–8 days)",
        shipping_address: address,
      })
      .select("id, order_number")
      .single();

    if (error || !order) {
      setPlacing(false);
      toast.error("We couldn't place your order. Please try again.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.product_id,
        product_name: line.name,
        image_url: line.image_url,
        unit_price: line.price,
        quantity: line.quantity,
      })),
    );

    await supabase.from("payments").insert({
      order_id: order.id,
      provider: "simulated",
      amount: total,
      status: "paid",
    });

    await supabase.from("cart_items").delete().eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["wishlist-detailed"] });

    setPlacing(false);
    if (itemsError) {
      toast.error("Order saved, but some items didn't attach. Our team will contact you.");
    }
    setOrderNumber(order.order_number as string);
    setStep(4);
  }

  function next() {
    if (step === 0) {
      const parsed = contactSchema.safeParse(contact);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Check your details");
        return;
      }
    }
    if (step === 1) {
      const parsed = addressSchema.safeParse(address);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Check your address");
        return;
      }
    }
    setStep((current) => current + 1);
  }

  return (
    <div className="container-craft py-12">
      <h1 className="font-display text-4xl text-foreground">Checkout</h1>

      <ol className="mt-8 flex flex-wrap gap-3" aria-label="Checkout progress">
        {STEPS.map((label, index) => (
          <li
            key={label}
            aria-current={index === step ? "step" : undefined}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              index === step
                ? "border-primary bg-primary text-primary-foreground"
                : index < step
                  ? "border-forest text-forest"
                  : "border-border text-muted-foreground"
            }`}
          >
            {index < step ? <Check className="h-3 w-3" /> : <span>{index + 1}</span>}
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-border/70 bg-card p-6 shadow-craft">
          {step === 0 && (
            <Fieldset title="Contact information">
              <Field label="Email" id="checkout-email">
                <Input
                  id="checkout-email"
                  type="email"
                  maxLength={255}
                  value={contact.email}
                  onChange={(event) => setContact({ ...contact, email: event.target.value })}
                />
              </Field>
              <Field label="Phone" id="checkout-phone">
                <Input
                  id="checkout-phone"
                  maxLength={20}
                  value={contact.phone}
                  onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                />
              </Field>
            </Fieldset>
          )}

          {step === 1 && (
            <Fieldset title="Shipping address">
              <Field label="Full name" id="ship-name">
                <Input id="ship-name" maxLength={100} value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
              </Field>
              <Field label="Address line 1" id="ship-line1">
                <Input id="ship-line1" maxLength={200} value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              </Field>
              <Field label="Address line 2 (optional)" id="ship-line2">
                <Input id="ship-line2" maxLength={200} value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" id="ship-city">
                  <Input id="ship-city" maxLength={80} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </Field>
                <Field label="State" id="ship-state">
                  <Input id="ship-state" maxLength={80} value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                </Field>
                <Field label="PIN code" id="ship-pin">
                  <Input id="ship-pin" maxLength={6} value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                </Field>
              </div>
            </Fieldset>
          )}

          {step === 2 && (
            <Fieldset title="Delivery method">
              <RadioGroup value={delivery} onValueChange={setDelivery} className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-4">
                  <RadioGroupItem value="standard" id="delivery-standard" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">Standard delivery — 5 to 8 days</span>
                    <span className="block text-sm text-muted-foreground">
                      {base.shipping === 0 ? "Free" : formatINR(base.shipping)}
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-4">
                  <RadioGroupItem value="express" id="delivery-express" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">Express delivery — 2 to 3 days</span>
                    <span className="block text-sm text-muted-foreground">{formatINR(199)}</span>
                  </span>
                </label>
              </RadioGroup>
            </Fieldset>
          )}

          {step === 3 && (
            <Fieldset title="Payment">
              <p className="text-sm text-muted-foreground">
                Card and UPI payments are not connected yet. Placing this order records it as paid so you can follow the
                full flow; a payment provider can be switched on later without changing your orders.
              </p>
              <div className="rounded-md border border-dashed border-border p-4 text-sm">
                <p className="font-medium text-foreground">Pay on confirmation (demo)</p>
                <p className="text-muted-foreground">Total charged: {formatINR(total)}</p>
              </div>
            </Fieldset>
          )}

          {step === 4 && (
            <div className="py-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest text-background">
                <Check className="h-7 w-7" />
              </span>
              <h2 className="mt-5 font-display text-2xl">Thank you — your order is confirmed</h2>
              <p className="mt-2 text-muted-foreground">
                Order {orderNumber}. We've emailed the details to {contact.email}.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/account">View my orders</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/shop">Continue shopping</Link>
                </Button>
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="mt-7 flex justify-between gap-3">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
                Back
              </Button>
              {step < 3 ? (
                <Button onClick={next}>Continue</Button>
              ) : (
                <Button onClick={placeOrder} disabled={placing}>
                  {placing ? "Placing order…" : `Place order · ${formatINR(total)}`}
                </Button>
              )}
            </div>
          )}
        </div>

        {step < 4 && (
          <aside className="h-fit rounded-lg border border-border/70 bg-card p-6 shadow-craft">
            <h2 className="font-display text-xl">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {lines?.map((line) => (
                <li key={line.id} className="flex items-center gap-3 text-sm">
                  <img src={line.image_url ?? ""} alt="" loading="lazy" className="h-12 w-12 rounded-md object-cover" />
                  <span className="flex-1">
                    {line.name} × {line.quantity}
                  </span>
                  <span>{formatINR(line.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <SummaryRow label="Subtotal" value={formatINR(subtotal)} />
              <SummaryRow label="Shipping" value={base.shipping + expressFee === 0 ? "Free" : formatINR(base.shipping + expressFee)} />
              <SummaryRow label="Tax (5% GST)" value={formatINR(base.tax)} />
              <SummaryRow label="Total" value={formatINR(total)} bold />
            </dl>
          </aside>
        )}
      </div>
    </div>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-xl text-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "font-display text-lg" : ""}>{value}</dd>
    </div>
  );
}

function Notice({ title, body, to, label }: { title: string; body: string; to: "/auth" | "/shop"; label: string }) {
  return (
    <div className="container-craft py-24 text-center">
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <Button className="mt-7" asChild>
        <Link to={to}>{label}</Link>
      </Button>
    </div>
  );
}
