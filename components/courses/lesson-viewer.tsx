"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/courses/quiz-card";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";

const portableTextComponents = {
  types: {
    table: ({ value }: any) => (
      <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
          <tbody>
            {(value.rows ?? []).map((row: any, rowIndex: number) => (
              <tr key={row._key ?? rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {(row.cells ?? []).map((cell: string, cellIndex: number) =>
                  rowIndex === 0 ? (
                    <th key={cellIndex} className="px-4 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIndex} className="px-4 py-2 border-b border-gray-100">
                      {cell}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    image: ({ value }: any) => (
      <div className="mb-6">
        <img
          src={value.asset?.url ?? urlFor(value).url()}
          alt={value.alt ?? ""}
          className="rounded-xl max-w-full"
        />
      </div>
    ),
    code: ({ value }: any) => (
      <pre className="mb-6 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-gray-100">
        <code>{value.code}</code>
      </pre>
    ),
  },
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{children}</h4>,
    normal: ({ children }: any) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="my-4 border-l-4 border-indigo-300 pl-4 italic text-gray-600">{children}</blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-semibold text-gray-900">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-indigo-700">{children}</code>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="mb-4 list-disc space-y-1 pl-6 text-gray-700">{children}</ul>,
    number: ({ children }: any) => <ol className="mb-4 list-decimal space-y-1 pl-6 text-gray-700">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  },
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: any[] | null;
  videoUrl: string | null;
  quiz: {
    id: string;
    title: string;
    questions: Array<{
      id: string;
      text: string;
      options: string[];
      correctAnswer: string;
    }>;
  } | null;
}

interface LessonViewerProps {
  lesson: Lesson;
  courseId: string;
  isCompleted: boolean;
}

export function LessonViewer({ lesson, courseId, isCompleted }: LessonViewerProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);

  const markComplete = async () => {
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonSanityId: lesson.id, isCompleted: true }),
    });
    setCompleted(true);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
        {completed && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Completed
          </div>
        )}
      </div>

      {lesson.description && (
        <p className="mb-6 text-gray-500">{lesson.description}</p>
      )}

      {/* Video */}
      {lesson.videoUrl && (
        <div className="mb-6 overflow-hidden rounded-xl bg-black aspect-video">
          <iframe
            src={lesson.videoUrl}
            className="h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          />
        </div>
      )}

      {/* Content */}
      {lesson.content && lesson.content.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <PortableText value={lesson.content} components={portableTextComponents} />
        </div>
      )}

      {/* Quiz */}
      {lesson.quiz && (
        <div className="mb-8">
          <QuizCard quiz={lesson.quiz} />
        </div>
      )}

      {!completed && (
        <Button onClick={markComplete} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Mark as complete
            </>
          )}
        </Button>
      )}
    </div>
  );
}
