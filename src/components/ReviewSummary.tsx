import { StarRating } from "@/components/StarRating";
import { getAverageRating, getRatingBreakdown, type Review } from "@/data/reviews";

export function ReviewSummary({ reviews }: { reviews: Review[] }) {
  const average = getAverageRating(reviews);
  const breakdown = getRatingBreakdown(reviews);
  const total = reviews.length;

  return (
    <div className="flex flex-col gap-8 border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-12">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <span className="text-5xl font-bold">{average.toFixed(1)}</span>
        <StarRating value={Math.round(average)} size="md" className="mt-2" />
        <p className="mt-1 text-xs text-muted-foreground">
          Based on {total} review{total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = breakdown[star];
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-10 shrink-0 font-semibold text-muted-foreground">{star} star</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-highlight transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
