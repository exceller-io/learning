import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { coursesListQuery, authorByUserIdQuery, type SanityCourseListItem, type SanityAuthor } from "@/lib/sanity-queries";

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().min(0).default(0),
  isFree: z.boolean().default(false),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

async function findOrCreateAuthor(userId: string, name: string | null | undefined, email: string | null | undefined): Promise<string> {
  const existing = await sanityClient.fetch<SanityAuthor | null>(authorByUserIdQuery, { userId });
  if (existing) return existing._id;

  const parts = (name ?? "").trim().split(/\s+/);
  const firstName = parts[0] ?? "Author";
  const lastName = parts.slice(1).join(" ") || "";

  const doc = await sanityWriteClient.create({
    _type: "author",
    firstName,
    lastName,
    email: email ?? "",
    bio: "",
    skills: [],
    userId,
  });

  return doc._id;
}

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
    (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categoryId, ...rest } = parsed.data;

  const authorId = await findOrCreateAuthor(session.user.id, session.user.name, session.user.email);

  const doc = await sanityWriteClient.create({
    _type: "course",
    ...rest,
    author: { _type: "reference", _ref: authorId },
    isPublished: false,
    modules: [],
    ...(categoryId && {
      category: { _type: "reference", _ref: categoryId },
    }),
  });

  return NextResponse.json({ id: doc._id, ...doc }, { status: 201 });
}
