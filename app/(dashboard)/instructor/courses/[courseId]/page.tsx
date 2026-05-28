import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { sanityClient } from "@/lib/sanity";
import { courseByIdQuery, categoriesQuery, type SanityCourse, type SanityCategory } from "@/lib/sanity-queries";
import { CourseEditForm } from "@/components/instructor/course-edit-form";
import { ModuleManager } from "@/components/instructor/module-manager";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function InstructorCourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const [course, categories] = await Promise.all([
    sanityClient.fetch<SanityCourse | null>(courseByIdQuery, { id: courseId }),
    sanityClient.fetch<SanityCategory[]>(categoriesQuery),
  ]);

  if (!course) notFound();
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor");
  }

  const completionFields = [
    course.title,
    course.description,
    course.category?._id,
    (course.modules ?? []).length > 0,
  ];
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  // Normalise for CourseEditForm (expects id, categoryId, etc.)
  const courseForForm = {
    id: course._id,
    title: course.title,
    description: course.description ?? null,
    price: course.price,
    isFree: course.isFree,
    isPublished: course.isPublished,
    categoryId: course.category?._id ?? null,
    imageUrl: course.imageUrl ?? null,
  };

  // Normalise modules for ModuleManager (expects id on modules and lessons)
  const modulesForManager = (course.modules ?? []).map((m) => ({
    id: m._key,
    title: m.title,
    position: m.position,
    lessons: (m.lessons ?? []).map((l) => ({
      id: l._key,
      title: l.title,
      isFree: l.isFree,
      position: l.position,
    })),
  }));

  // Normalise categories to { id, name }
  const categoriesForForm = categories.map((c) => ({ id: c._id, name: c.name }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/instructor" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        <div className="flex items-center gap-3">
          {course.isPublished ? (
            <Badge variant="success" className="gap-1">
              <Eye className="h-3 w-3" /> Published
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <EyeOff className="h-3 w-3" /> Draft
            </Badge>
          )}
          <span className="text-xs text-gray-400">
            Profile {completionPct}% complete
          </span>
        </div>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">{course.title}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <CourseEditForm course={courseForForm} categories={categoriesForForm} />
        <ModuleManager courseId={courseId} modules={modulesForManager} />
      </div>
    </div>
  );
}
