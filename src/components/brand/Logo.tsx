import { Link } from "@tanstack/react-router";

type LogoProps = {
  className?: string;
  compact?: boolean;
};

/**
 * IndiTribe Crafts mark: a hand-drawn loom diamond enclosing a sprouting seed,
 * inspired by tribal wall motifs.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="IndiTribe Crafts logo"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 3 37 20 20 37 3 20 20 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 11 29 20l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
      <path d="M20 25v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 18c0-2.6 1.9-4.6 4.4-4.9-.2 2.7-2 4.6-4.4 4.9Z" fill="currentColor" />
      <path d="M20 20c-2.4-.3-4.2-2.2-4.4-4.9 2.5.3 4.4 2.3 4.4 4.9Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className ?? ""}`} aria-label="IndiTribe Crafts home">
      <LogoMark className="h-9 w-9 text-primary transition-transform group-hover:-rotate-6" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            IndiTribe <span className="text-primary">Crafts</span>
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Stories made by hand
          </span>
        </span>
      )}
    </Link>
  );
}
