import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { courseByIdQuery, type SanityCourse } from "@/lib/sanity-queries";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().nullable(),
  isFree: z.boolean().optional(),
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

async function assertOwnership(courseId: string, session: { user: { id: string; role: string } }) {
  const course = await sanityClient.fetch<SanityCourse | null>(courseByIdQuery, { id: courseId });
  if (!course) return null;
  if (course.author?.userId !== session.user.id && session.user.role !== "ADMIN") return false;
  return course;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, moduleId, lessonId } = await params;
  const ownership = await assertOwnership(courseId, session);
  if (ownership === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ownership === false) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const path = `modules[_key=="${moduleId}"].lessons[_key=="${lessonId}"]`;

  const setFields: Record<string, unknown> = {};
  const unsetFields: string[] = [];

  if (parsed.data.title !== undefined) setFields[`${path}.title`] = parsed.data.title;
  if (parsed.data.description !== undefined) setFields[`${path}.description`] = parsed.data.description;
  if (parsed.data.isFree !== undefined) setFields[`${path}.isFree`] = parsed.data.isFree;
  if (parsed.data.videoUrl === null) unsetFields.push(`${path}.videoUrl`);
  else if (parsed.data.videoUrl) setFields[`${path}.videoUrl`] = parsed.data.videoUrl;
  if (parsed.data.content) setFields[`${path}.content`] = textToPortableText(parsed.data.content);

  let patch = sanityWriteClient.patch(courseId);
  if (Object.keys(setFields).length) patch = patch.set(setFields);
  if (unsetFields.length) patch = patch.unset(unsetFields);
  const updated = await patch.commit();

  return NextResponse.json({ id: lessonId, ...updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, moduleId, lessonId } = await params;
  const ownership = await assertOwnership(courseId, session);
  if (ownership === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ownership === false) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await sanityWriteClient
    .patch(courseId)
    .unset([`modules[_key=="${moduleId}"].lessons[_key=="${lessonId}"]`])
    .commit();

  return NextResponse.json({ success: true });
}
