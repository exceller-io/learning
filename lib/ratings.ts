import { db } from "@/lib/db";

export type RatingSummary = { average: number; count: number };

export async function getBatchRatings(
  contentType: "course" | "article",
  contentIds: string[]
): Promise<Record<string, RatingSummary>> {
  if (contentIds.length === 0) return {};

  const rows = await db.rating.groupBy({
    by: ["contentId"],
    where: { contentType, contentId: { in: contentIds } },
    _avg: { value: true },
    _count: { value: true },
  });

  return Object.fromEntries(
    rows
      .filter((r) => r._avg.value !== null && r._count.value > 0)
      .map((r) => [r.contentId, { average: r._avg.value as number, count: r._count.value }])
  );
}
