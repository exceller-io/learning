import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { categoriesQuery, type SanityCategory } from "@/lib/sanity-queries";
import { z } from "zod";

export async function GET() {
  const categories = await sanityClient.fetch<SanityCategory[]>(categoriesQuery);
  // Normalise to the shape the rest of the UI expects ({ id, name })
  return NextResponse.json(
    categories.map((c) => ({ id: c._id, name: c.name }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = z.object({ name: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const doc = await sanityWriteClient.create({
    _type: "category",
    name: parsed.data.name,
    slug: { _type: "slug", current: slug },
  });

  return NextResponse.json({ id: doc._id, name: parsed.data.name }, { status: 201 });
}
