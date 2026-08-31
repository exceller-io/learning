import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { sanityClient } from "@/lib/sanity";
import { featuredTestimonialsQuery, type SanityTestimonial } from "@/lib/sanity-queries";

async function getFeaturedTestimonials(): Promise<SanityTestimonial[]> {
  return sanityClient.fetch(featuredTestimonialsQuery);
}

export async function Testimonials() {
  const testimonials = await getFeaturedTestimonials();

  // Pure social-proof content — an empty state here would undercut the point
  // of the section, so it simply doesn't render until testimonials exist.
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">What our learners say</h2>
          <p className="mt-2 text-gray-500">
            Real feedback from people who&apos;ve taken our courses
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial._id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: SanityTestimonial }) {
  const initial = testimonial.name.charAt(0).toUpperCase();
  const roleAndCompany = [testimonial.role, testimonial.company].filter(Boolean).join(" at ");

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Quote className="h-6 w-6 text-indigo-200" fill="currentColor" strokeWidth={0} />

      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-700">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {testimonial.rating ? (
        <div className="mt-4 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${
                star <= testimonial.rating!
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
        {testimonial.avatarUrl ? (
          <Image
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {initial}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
          {roleAndCompany ? <p className="text-xs text-gray-500">{roleAndCompany}</p> : null}
        </div>
      </div>
    </div>
  );
}
