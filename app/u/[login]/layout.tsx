import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { login: string };
}): Promise<Metadata> {
  const { login } = params;
  const title = `@${login} — GCV contributor profile`;
  const description = `Open source contribution activity, top repos, and language breakdown for ${login} on GCV — GitHub Community Vitals.`;
  const url = `https://gcv-five.vercel.app/u/${login}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "GCV — GitHub Community Vitals" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
