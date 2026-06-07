import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const postSchema = z.object({
  contentType: z.enum(["course", "article"]),
  contentId: z.string(),
  value: z.number().int().min(1).max(5),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("contentType");
  const contentId = searchParams.get("contentId");

  if (!contentType || !contentId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const session = await auth();

  const [aggregate, userRatingRecord] = await Promise.all([
    db.rating.aggregate({
      where: { contentType, contentId },
      _avg: { value: true },
      _count: { value: true },
    }),
    session
      ? db.rating.findUnique({
          where: {
            userId_contentType_contentId: {
              userId: session.user.id,
              contentType,
              contentId,
            },
          },
          select: { value: true },
        })
      : null,
  ]);

  return NextResponse.json({
    average: aggregate._avg.value,
    count: aggregate._count.value,
    userRating: userRatingRecord?.value ?? null,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { contentType, contentId, value } = parsed.data;

  if (contentType === "course") {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_sanityCourseId: { userId: session.user.id, sanityCourseId: contentId } },
    });
    if (enrollment?.status !== "ACTIVE") {
      return NextResponse.json({ error: "Must be enrolled to rate this course" }, { status: 403 });
    }
  }

  const rating = await db.rating.upsert({
    where: {
      userId_contentType_contentId: {
        userId: session.user.id,
        contentType,
        contentId,
      },
    },
    update: { value },
    create: { userId: session.user.id, contentType, contentId, value },
  });

  return NextResponse.json(rating);
}
