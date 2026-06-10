import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { login: string };
}): Promise<Metadata> {
  const { login } = params;
  const year = new Date().getFullYear();
  const title = `${login}'s GCV Wrapped ${year} — GCV`;
  const description = `${login}'s open source year in review — commits, top repos, languages, and more on GCV — GitHub Community Vitals.`;
  const url = `https://gcv-five.vercel.app/wrapped/${login}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "GCV — GitHub Community Vitals", type: "profile" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  };
}

export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
