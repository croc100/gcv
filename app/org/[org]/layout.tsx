import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { org: string };
}): Promise<Metadata> {
  const { org } = params;
  const title = `${org} — org contributors — GCV`;
  const description = `Top contributors across all ${org} repositories on GitHub Contributor Viewer.`;
  const url = `https://gcv-five.vercel.app/org/${org}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "GCV" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
