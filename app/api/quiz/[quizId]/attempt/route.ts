import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanityClient } from "@/lib/sanity";
import { quizByLessonKeyQuery, type SanityQuiz } from "@/lib/sanity-queries";

const schema = z.object({
  answers: z.record(z.string(), z.string()),
});

async function fetchQuizByLessonKey(lessonKey: string): Promise<SanityQuiz | null> {
  const results = await sanityClient.fetch<
    Array<{ modules: Array<{ lessons: Array<{ quiz?: SanityQuiz }> }> }>
  >(quizByLessonKeyQuery, { key: lessonKey });

  for (const course of results) {
    for (const mod of course.modules ?? []) {
      if (mod.lessons?.length) {
        return mod.lessons[0].quiz ?? null;
      }
    }
  }
  return null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quizId } = await params;
  const quiz = await fetchQuizByLessonKey(quizId);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { answers } = parsed.data;
  const correct = quiz.questions.filter((q) => answers[q._key] === q.correctAnswer).length;
  const score = quiz.questions.length > 0 ? (correct / quiz.questions.length) * 100 : 0;

  const attempt = await db.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizSanityId: quizId,
      score,
      answers: JSON.stringify(answers),
    },
  });

  return NextResponse.json({
    score,
    correct,
    total: quiz.questions.length,
    attemptId: attempt.id,
  });
}
