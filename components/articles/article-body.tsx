"use client";

import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = value?.asset?.url ?? value?.coverImageUrl;
      if (!url) return null;
      return (
        <figure className="my-8">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src={url}
              alt={value.alt ?? ""}
              width={800}
              height={450}
              className="w-full object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    codeBlock: ({ value }) => (
      <div className="my-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-950">
        {(value.filename || value.language) && (
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
            {value.filename && (
              <span className="text-xs font-medium text-gray-400">{value.filename}</span>
            )}
            {value.language && (
              <span className="ml-auto text-xs text-gray-500">{value.language}</span>
            )}
          </div>
        )}
        <pre className="overflow-x-auto p-4 text-sm text-gray-100">
          <code>{value.code}</code>
        </pre>
      </div>
    ),
  },
  block: {
    h1: ({ children }) => (
      <h1 className="mb-4 mt-10 text-3xl font-bold text-gray-900">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-8 text-2xl font-bold text-gray-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 text-xl font-semibold text-gray-900">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="mb-4 leading-7 text-gray-700">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-indigo-400 pl-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc pl-6 space-y-1 text-gray-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal pl-6 space-y-1 text-gray-700">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-indigo-700">
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
      >
        {children}
      </a>
    ),
  },
};

interface ArticleBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any[];
}

export function ArticleBody({ body }: ArticleBodyProps) {
  return <PortableText value={body} components={components} />;
}
