import { MetadataRoute } from "next";

const BASE = "https://gcv-five.vercel.app";

// Popular repos and orgs to seed the sitemap for crawlers
const SEED_REPOS = [
  "vercel/next.js", "facebook/react", "microsoft/vscode", "golang/go",
  "torvalds/linux", "denoland/deno", "rust-lang/rust", "python/cpython",
  "kubernetes/kubernetes", "tensorflow/tensorflow", "vuejs/vue", "sveltejs/svelte",
];

const SEED_ORGS = ["vercel", "facebook", "microsoft", "google", "golang", "rust-lang"];

const SEED_USERS = ["torvalds", "gaearon", "yyx990803", "Rich-Harris", "sindresorhus"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/trending`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const repoRoutes: MetadataRoute.Sitemap = SEED_REPOS.map((r) => ({
    url: `${BASE}/${r}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const orgRoutes: MetadataRoute.Sitemap = SEED_ORGS.map((org) => ({
    url: `${BASE}/org/${org}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const userRoutes: MetadataRoute.Sitemap = SEED_USERS.flatMap((u) => [
    { url: `${BASE}/u/${u}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE}/wrapped/${u}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
  ]);

  return [...staticRoutes, ...repoRoutes, ...orgRoutes, ...userRoutes];
}
