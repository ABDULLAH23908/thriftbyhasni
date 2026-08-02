import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { ImageDropzone } from "@/components/ImageDropzone";

type ReviewFormProps = {
  onSubmit: (input: {
    name: string;
    avatarUrl?: string | undefined;
    rating: number;
    description: string;
  }) => void;
  trigger?: React.ReactNode;
};

type Errors = Partial<Record<"name" | "rating" | "description", string>>;

export function ReviewForm({ onSubmit, trigger }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function reset() {
    setName("");
    setAvatarUrl(undefined);
    setRating(0);
    setDescription("");
    setErrors({});
  }

  function validate(): boolean {
    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = "Please enter your name.";
    if (rating < 1 || rating > 5) nextErrors.rating = "Please select a star rating.";
    if (!description.trim()) nextErrors.description = "Please write a short review.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name, avatarUrl, rating, description });
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90">
            Write a review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            No account needed — just share your honest experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="review-name">Name</Label>
            <Input
              id="review-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Photo (optional)</Label>
            <ImageDropzone value={avatarUrl} onChange={setAvatarUrl} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="review-description">Review</Label>
            <Textarea
              id="review-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your order..."
              rows={4}
              maxLength={600}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <Button type="submit" className="mt-1 bg-brand text-brand-foreground hover:bg-brand/90">
            Submit review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
