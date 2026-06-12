import { Star } from "lucide-react";
import type { RatingSummary } from "@/lib/ratings";

export function RatingStars({ rating }: { rating: RatingSummary }) {
  const filled = Math.round(rating.average);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= filled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">
        <span className="font-medium text-gray-700">{rating.average.toFixed(1)}</span>
        <span className="ml-1 text-gray-400">({rating.count})</span>
      </span>
    </div>
  );
}
