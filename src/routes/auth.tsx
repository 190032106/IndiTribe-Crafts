import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — IndiTribe Crafts" },
      {
        name: "description",
        content: "Sign in to your IndiTribe Crafts account to shop tribal crafts, track orders and save favourites.",
      },
      { property: "og:title", content: "Sign in — IndiTribe Crafts" },
      { property: "og:description", content: "Access your IndiTribe Crafts account, orders and wishlist." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account", replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);

    if (mode === "signup") {
      const parsed = signUpSchema.safeParse({ fullName, email, password });
      if (!parsed.success) {
        setBusy(false);
        toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: parsed.data.fullName },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setCheckEmail(true);
        return;
      }
      toast.success("Welcome to IndiTribe Crafts");
      navigate({ to: "/account" });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error("Those details don't match an account.");
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/account" });
  }

  async function handleGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Google sign-in is unavailable right now.");
      return;
    }
    if (data?.url) {
      window.location.assign(data.url);
      return;
    }
    navigate({ to: "/account" });
  }

  if (checkEmail) {
    return (
      <div className="container-craft flex min-h-[60vh] items-center justify-center py-16">
        <div className="max-w-md rounded-lg border border-border/70 bg-card p-8 text-center shadow-craft">
          <LogoMark className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a confirmation link to {email}. Click it to activate your account, then sign in.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => { setCheckEmail(false); setMode("signin"); }}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-craft grid gap-10 py-14 lg:grid-cols-2">
      <div className="hidden rounded-lg bg-clay p-10 text-background lg:block">
        <LogoMark className="h-10 w-10 text-saffron" />
        <h2 className="mt-6 font-display text-3xl">Buy directly from the makers.</h2>
        <p className="mt-4 text-background/80">
          An account lets you keep a bag across devices, save favourite pieces, track your orders and review the crafts
          you bring home.
        </p>
        <div className="motif-chevron mt-10 h-16 w-full rounded-md opacity-60" aria-hidden="true" />
      </div>

      <div className="mx-auto w-full max-w-md rounded-lg border border-border/70 bg-card p-8 shadow-craft">
        <h1 className="font-display text-2xl text-foreground">
          {mode === "signin" ? "Sign in to your account" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin" ? "Welcome back to IndiTribe Crafts." : "Shoppers and artisans both start here."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                value={fullName}
                maxLength={100}
                required
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              maxLength={255}
              required
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              minLength={8}
              maxLength={72}
              required
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to IndiTribe Crafts?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Want to sell your craft?{" "}
          <Link to="/sell" className="text-primary hover:underline">
            Become an artisan partner
          </Link>
        </p>
      </div>
    </div>
  );
}
