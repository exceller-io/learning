import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { courseByIdQuery, type SanityCourse } from "@/lib/sanity-queries";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  imageUrl: z.string().url().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const course = await sanityClient.fetch<SanityCourse | null>(
    courseByIdQuery,
    { id: courseId }
  );
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...course, id: course._id });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const course = await sanityClient.fetch<SanityCourse | null>(
    courseByIdQuery,
    { id: courseId }
  );
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (course.author?.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categoryId, ...rest } = parsed.data;
  const patch: Record<string, unknown> = { ...rest };

  if (categoryId === null) {
    await sanityWriteClient.patch(courseId).unset(["category"]).commit();
  } else if (categoryId) {
    patch.category = { _type: "reference", _ref: categoryId };
  }

  const updated = await sanityWriteClient
    .patch(courseId)
    .set(patch)
    .commit();

  return NextResponse.json({ ...updated, id: updated._id });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const course = await sanityClient.fetch<SanityCourse | null>(
    courseByIdQuery,
    { id: courseId }
  );
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (course.author?.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await sanityWriteClient.delete(courseId);
  return NextResponse.json({ success: true });
}
