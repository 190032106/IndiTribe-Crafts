import { Star } from "lucide-react";

export function StarRating({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ""}`} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          width={size}
          height={size}
          aria-hidden="true"
          className={star <= Math.round(rating) ? "fill-saffron text-saffron" : "text-border"}
        />
      ))}
    </span>
  );
}
