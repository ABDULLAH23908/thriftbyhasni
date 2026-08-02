import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewSummary } from "@/components/ReviewSummary";
import { addReview, loadReviews, seedReviews, type Review } from "@/data/reviews";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews — TBH Thrift" },
      {
        name: "description",
        content: "Read what customers are saying about TBH Thrift, or leave your own review.",
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(seedReviews);

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  function handleSubmit(input: {
    name: string;
    avatarUrl?: string;
    rating: number;
    description: string;
  }) {
    setReviews((prev) => addReview(prev, input));
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-highlight">
              Customer reviews
            </p>
            <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              What people are saying
            </h1>
          </div>
          <ReviewForm onSubmit={handleSubmit} />
        </div>

        <div className="mt-8">
          <ReviewSummary reviews={reviews} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} variant="grid" />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
