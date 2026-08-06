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
      { title: "Customer Reviews — Thrift by Hasni" },
      {
        name: "description",
        content:
          "Real reviews from Thrift by Hasni customers on pair quality, condition grading and delivery — and leave your own.",
      },
      { property: "og:title", content: "Customer Reviews — Thrift by Hasni" },
      {
        property: "og:description",
        content:
          "See what buyers say about our graded thrifted sneakers, then add your own review.",
      },
      { property: "og:url", content: "https://thriftbyhasni.lovable.app/reviews" },
    ],
    links: [{ rel: "canonical", href: "https://thriftbyhasni.lovable.app/reviews" }],
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
    avatarUrl?: string | undefined;
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
              Customer Reviews for Thrift by Hasni
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
