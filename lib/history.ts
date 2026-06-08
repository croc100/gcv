export type RepoEntry = {
  owner: string;
  repo: string;
  visitedAt: number;
};

const RECENT_KEY = "gcv_recent";
const FAVORITES_KEY = "gcv_favorites";
const MAX_RECENT = 10;

export function getRecent(): RepoEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function recordVisit(owner: string, repo: string) {
  const list = getRecent().filter(
    (e) => !(e.owner === owner && e.repo === repo)
  );
  list.unshift({ owner, repo, visitedAt: Date.now() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorite(owner: string, repo: string): boolean {
  return getFavorites().includes(`${owner}/${repo}`);
}

export function toggleFavorite(owner: string, repo: string): boolean {
  const key = `${owner}/${repo}`;
  const favs = getFavorites();
  const idx = favs.indexOf(key);
  if (idx === -1) {
    favs.unshift(key);
  } else {
    favs.splice(idx, 1);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return idx === -1;
}
