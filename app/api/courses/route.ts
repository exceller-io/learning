import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { coursesListQuery, type SanityCourseListItem } from "@/lib/sanity-queries";

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().min(0).default(0),
  isFree: z.boolean().default(false),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";

  const courses = await sanityClient.fetch<SanityCourseListItem[]>(
    coursesListQuery,
    { search, categoryId }
  );

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categoryId, ...rest } = parsed.data;

  const doc = await sanityWriteClient.create({
    _type: "course",
    ...rest,
    instructorId: session.user.id,
    instructorName: session.user.name ?? undefined,
    isPublished: false,
    modules: [],
    ...(categoryId && {
      category: { _type: "reference", _ref: categoryId },
    }),
  });

  return NextResponse.json({ id: doc._id, ...doc }, { status: 201 });
}
