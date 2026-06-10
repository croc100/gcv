import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find repos to contribute — GCV",
  description: "Discover active GitHub repositories with good first issues — perfect for first-time open source contributors.",
  openGraph: { title: "Find repos to contribute — GCV", description: "Active repos with good first issues for new contributors.", siteName: "GCV — GitHub Community Vitals" },
  alternates: { canonical: "https://gcv-five.vercel.app/explore" },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
