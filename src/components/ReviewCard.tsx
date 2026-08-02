import { Quote } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import type { Review } from "@/data/reviews";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReviewCard({
  review,
  variant = "grid",
}: {
  review: Review;
  variant?: "grid" | "carousel";
}) {
  const isCarousel = variant === "carousel";

  return (
    <article
      className={
        isCarousel
          ? "relative flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-1"
          : "flex h-full flex-col border border-border bg-card p-5"
      }
    >
      {isCarousel && (
        <Quote className="absolute right-5 top-5 h-8 w-8 text-highlight/25" strokeWidth={1.5} />
      )}
      <div className="flex items-center gap-3">
        <Avatar className={isCarousel ? "h-11 w-11" : "h-10 w-10"}>
          {review.avatarUrl && <AvatarImage src={review.avatarUrl} alt={review.name} />}
          <AvatarFallback className="bg-brand text-xs font-bold text-brand-foreground">
            {getInitials(review.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold leading-tight">{review.name}</p>
          <p className="text-[11px] text-muted-foreground">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      <StarRating value={review.rating} size="sm" className="mt-3" />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {review.description}
      </p>
    </article>
  );
}
