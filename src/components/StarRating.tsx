import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export function StarRating({ value, onChange, size = "md", className }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const display = hovered ?? value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={() => interactive && setHovered(null)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Rating" : `Rated ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            className={cn(
              "transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default",
            )}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled ? "fill-highlight text-highlight" : "fill-transparent text-muted-foreground",
              )}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
