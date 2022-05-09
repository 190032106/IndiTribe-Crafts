import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — IndiTribe Crafts" },
      { name: "description", content: "Manage your IndiTribe Crafts profile, orders and addresses." },
      { property: "og:title", content: "My account — IndiTribe Crafts" },
      { property: "og:description", content: "Manage your profile, orders and addresses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total: string | number;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; unit_price: string | number; image_url: string | null }[];
};

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("full_name, phone, email").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at, order_items ( id, product_name, quantity, unit_price, image_url )")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setFullName((profileQuery.data.full_name as string) ?? "");
      setPhone((profileQuery.data.phone as string) ?? "");
    }
  }, [profileQuery.data]);

  if (loading || !user) {
    return (
      <div className="container-craft py-14">
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim().slice(0, 100), phone: phone.trim().slice(0, 20) })
      .eq("id", user!.id);
    setSavingProfile(false);
    if (error) {
      toast.error("Could not save your details.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Details saved");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="container-craft py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground">My account</h1>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="orders" className="mt-9">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="links">Saved & selling</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {ordersQuery.isLoading ? (
            <Skeleton className="h-52 w-full rounded-lg" />
          ) : !ordersQuery.data || ordersQuery.data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-14 text-center">
              <p className="text-muted-foreground">You haven't placed an order yet.</p>
              <Button className="mt-5" asChild>
                <Link to="/shop">Shop the collection</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {ordersQuery.data.map((order) => (
                <li key={order.id} className="rounded-lg border border-border/70 bg-card p-5 shadow-craft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize text-secondary-foreground">
                      {order.status}
                    </span>
                    <p className="font-display text-lg">{formatINR(Number(order.total))}</p>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        {item.image_url && (
                          <img src={item.image_url} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
                        )}
                        <span className="flex-1">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span>{formatINR(Number(item.unit_price) * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <form onSubmit={saveProfile} className="max-w-md space-y-4 rounded-lg border border-border/70 bg-card p-6 shadow-craft">
            <div>
              <Label htmlFor="account-name">Full name</Label>
              <Input
                id="account-name"
                className="mt-2"
                maxLength={100}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="account-phone">Phone</Label>
              <Input
                id="account-phone"
                className="mt-2"
                maxLength={20}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save details"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <LinkCard to="/wishlist" title="Saved crafts" body="Pieces you've kept for later." />
            <LinkCard to="/sell" title="Sell on IndiTribe" body="Apply to list your own craft." />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LinkCard({ to, title, body }: { to: "/wishlist" | "/sell"; title: string; body: string }) {
  return (
    <Link to={to} className="rounded-lg border border-border/70 bg-card p-6 shadow-craft transition-shadow hover:shadow-craft-lg">
      <h2 className="font-display text-xl">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
