import type { ReactNode } from "react";

export function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="container-craft max-w-3xl py-14">
      {eyebrow && <p className="text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-4xl text-foreground">{title}</h1>
      {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
      <div className="prose-craft mt-8 space-y-5 text-foreground/85">{children}</div>
    </div>
  );
}

export function InfoBlock({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-foreground">{heading}</h2>
      <div className="mt-2 space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}
