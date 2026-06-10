import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { owner: string; repo: string };
}): Promise<Metadata> {
  const { owner, repo } = params;
  const title = `${owner}/${repo} contributors — GCV`;
  const description = `Explore contributors, commit trends, and growth history for ${owner}/${repo} on GCV — GitHub Community Vitals.`;
  const url = `https://gcv-five.vercel.app/${owner}/${repo}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "GCV — GitHub Community Vitals" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
