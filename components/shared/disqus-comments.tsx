"use client";

import dynamic from "next/dynamic";

const DiscussionEmbed = dynamic(
  () => import("disqus-react").then((m) => m.DiscussionEmbed),
  { ssr: false }
);

type Props = {
  identifier: string;
  title: string;
  shortname: string;
};

export function DisqusComments({ identifier, title, shortname }: Props) {
  if (!shortname) return null;

  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Comments</h2>
      <DiscussionEmbed
        shortname={shortname}
        config={{
          identifier,
          title,
          language: "en",
        }}
      />
    </div>
  );
}
