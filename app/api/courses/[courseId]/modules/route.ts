import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { courseByIdQuery, type SanityCourse } from "@/lib/sanity-queries";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

function randomKey() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const course = await sanityClient.fetch<SanityCourse | null>(courseByIdQuery, { id: courseId });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (course.author?.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const position = (course.modules ?? []).length;
  const moduleKey = randomKey();

  await sanityWriteClient
    .patch(courseId)
    .append("modules", [{
      _key: moduleKey,
      _type: "module",
      title: parsed.data.title,
      ...(parsed.data.description && { description: parsed.data.description }),
      position,
      lessons: [],
    }])
    .commit();

  return NextResponse.json({ id: moduleKey, _key: moduleKey }, { status: 201 });
}
