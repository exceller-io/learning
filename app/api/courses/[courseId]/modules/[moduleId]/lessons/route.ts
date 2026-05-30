import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { courseByIdQuery, type SanityCourse } from "@/lib/sanity-queries";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  isFree: z.boolean().default(false),
});

function randomKey() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function textToPortableText(text: string) {
  return [{
    _key: randomKey(),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: randomKey(), _type: "span", marks: [], text }],
  }];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, moduleId } = await params;
  const course = await sanityClient.fetch<SanityCourse | null>(courseByIdQuery, { id: courseId });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (course.author?.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const mod = (course.modules ?? []).find((m) => m._key === moduleId);
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const lessonKey = randomKey();
  const position = (mod.lessons ?? []).length;

  await sanityWriteClient
    .patch(courseId)
    .append(`modules[_key=="${moduleId}"].lessons`, [{
      _key: lessonKey,
      _type: "lesson",
      title: parsed.data.title,
      ...(parsed.data.description && { description: parsed.data.description }),
      ...(parsed.data.content && { content: textToPortableText(parsed.data.content) }),
      ...(parsed.data.videoUrl && { videoUrl: parsed.data.videoUrl }),
      isFree: parsed.data.isFree,
      position,
    }])
    .commit();

  return NextResponse.json({ id: lessonKey, _key: lessonKey }, { status: 201 });
}
