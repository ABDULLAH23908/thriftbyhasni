import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReviewCard } from "@/components/ReviewCard";
import { cn } from "@/lib/utils";
import type { Review } from "@/data/reviews";

const AUTOPLAY_INTERVAL = 5000;

export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-cycle every 5 seconds, pausing on hover
  useEffect(() => {
    if (!emblaApi) return;
    let paused = false;
    const interval = setInterval(() => {
      if (!paused) emblaApi.scrollNext();
    }, AUTOPLAY_INTERVAL);

    const node = emblaApi.rootNode();
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    node.addEventListener("mouseenter", pause);
    node.addEventListener("mouseleave", resume);

    return () => {
      clearInterval(interval);
      node.removeEventListener("mouseenter", pause);
      node.removeEventListener("mouseleave", resume);
    };
  }, [emblaApi]);

  if (reviews.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="min-w-0 shrink-0 grow-0 basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
            >
              <ReviewCard review={review} variant="carousel" />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous reviews"
        className="absolute left-0 top-1/2 hidden -translate-x-4 -translate-y-1/2 rounded-full border border-border/60 bg-background/90 p-2 shadow-md backdrop-blur transition-transform hover:-translate-x-5 sm:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next reviews"
        className="absolute right-0 top-1/2 hidden translate-x-4 -translate-y-1/2 rounded-full border border-border/60 bg-background/90 p-2 shadow-md backdrop-blur transition-transform hover:translate-x-5 sm:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="mt-6 flex items-center justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === selectedIndex ? "w-6 bg-highlight" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>

      {/* Mobile prev/next, shown under the dots since side arrows are desktop-only */}
      <div className="mt-3 flex items-center justify-center gap-4 sm:hidden">
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous reviews"
          className="rounded-full border border-border/60 bg-background p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next reviews"
          className="rounded-full border border-border/60 bg-background p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
