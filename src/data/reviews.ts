export type Review = {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number; // 1-5
  description: string;
  createdAt: string; // ISO date string
};

const STORAGE_KEY = "tbh_reviews";

export const seedReviews: Review[] = [
  {
    id: "r1",
    name: "Hamza Raza",
    avatarUrl: "",
    rating: 5,
    description:
      "Ordered the Jordan 1s in Excellence condition and honestly they looked better than the photos. Delivery was quick and the guy on WhatsApp kept me updated the whole time.",
    createdAt: "2026-06-14T10:20:00.000Z",
  },
  {
    id: "r2",
    name: "Ayesha Khan",
    avatarUrl: "",
    rating: 4,
    description:
      "Good pair, minor sole scuff that wasn't super obvious in the pictures but nothing a clean couldn't fix. Price was fair for the grade. Would order again.",
    createdAt: "2026-06-10T15:05:00.000Z",
  },
  {
    id: "r3",
    name: "Bilal Ahmed",
    avatarUrl: "",
    rating: 5,
    description:
      "Genuinely the most honest thrift page I've bought from in Rawalpindi. What you see is what you get, sizing was accurate and packaging was solid.",
    createdAt: "2026-06-02T09:40:00.000Z",
  },
  {
    id: "r4",
    name: "Fatima Sheikh",
    avatarUrl: "",
    rating: 5,
    description:
      "The New Balance 550s are premium+ grade and they genuinely look brand new. Super happy, already recommended this page to two of my friends.",
    createdAt: "2026-05-27T18:15:00.000Z",
  },
  {
    id: "r5",
    name: "Usman Tariq",
    avatarUrl: "",
    rating: 3,
    description:
      "Shoes were fine but shipping took a bit longer than expected. Communication was good throughout though, so I'm not too worried about ordering again.",
    createdAt: "2026-05-19T12:00:00.000Z",
  },
  {
    id: "r6",
    name: "Mahnoor Iqbal",
    avatarUrl: "",
    rating: 5,
    description:
      "Bought a pair for my brother's birthday and he loved them. Grading was spot on, very good condition just like it said on the listing.",
    createdAt: "2026-05-11T08:30:00.000Z",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadReviews(): Review[] {
  if (!isBrowser()) return seedReviews;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedReviews;
    const parsed = JSON.parse(raw) as Review[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedReviews;
    return parsed;
  } catch {
    return seedReviews;
  }
}

export function saveReviews(reviews: Review[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // localStorage unavailable (private mode, etc.) — fail silently
  }
}

export function addReview(
  reviews: Review[],
  input: { name: string; avatarUrl?: string | undefined; rating: number; description: string },
): Review[] {
  const trimmedAvatar = input.avatarUrl?.trim();
  const newReview: Review = {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    rating: input.rating,
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
    ...(trimmedAvatar ? { avatarUrl: trimmedAvatar } : {}),
  };
  const next = [newReview, ...reviews];
  saveReviews(next);
  return next;
}

export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

export function getRatingBreakdown(reviews: Review[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[rounded] += 1;
  }
  return breakdown;
}
