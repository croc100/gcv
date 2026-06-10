import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending repos — GCV",
  description: "Most starred GitHub repositories pushed this week, filterable by language.",
  openGraph: { title: "Trending repos — GCV", description: "Most starred GitHub repos pushed this week.", siteName: "GCV" },
  alternates: { canonical: "https://gcv-five.vercel.app/trending" },
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
