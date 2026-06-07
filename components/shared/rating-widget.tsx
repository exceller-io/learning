"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  contentType: "course" | "article";
  contentId: string;
  initialAverage: number | null;
  initialCount: number;
  initialUserRating: number | null;
  canRate: boolean;
};

export function RatingWidget({
  contentType,
  contentId,
  initialAverage,
  initialCount,
  initialUserRating,
  canRate,
}: Props) {
  const [userRating, setUserRating] = useState(initialUserRating);
  const [hovered, setHovered] = useState<number | null>(null);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [submitting, setSubmitting] = useState(false);

  async function handleRate(value: number) {
    if (!canRate || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId, value }),
      });
      if (res.ok) {
        const aggRes = await fetch(`/api/ratings?contentType=${contentType}&contentId=${contentId}`);
        if (aggRes.ok) {
          const data = await aggRes.json();
          setAverage(data.average);
          setCount(data.count);
          setUserRating(value);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  const activeRating = hovered ?? userRating ?? (average !== null ? Math.round(average) : 0);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!canRate || submitting}
            onClick={() => handleRate(star)}
            onMouseEnter={() => canRate && setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className={canRate ? "cursor-pointer" : "cursor-default"}
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= activeRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {average !== null ? (
          <>
            <span className="font-semibold">{average.toFixed(1)}</span>
            <span className="ml-1 text-gray-400">
              ({count} {count === 1 ? "rating" : "ratings"})
            </span>
          </>
        ) : (
          <span className="text-gray-400">No ratings yet</span>
        )}
      </span>
      {!canRate && (
        <span className="text-xs text-gray-400">
          {contentType === "course" ? "Enroll to rate" : "Sign in to rate"}
        </span>
      )}
    </div>
  );
}
