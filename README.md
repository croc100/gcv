# GCV — GitHub Contributor Viewer

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" />
  <a href="https://gcv-five.vercel.app"><img src="https://img.shields.io/badge/live-gcv--five.vercel.app-brightgreen" alt="Live" /></a>
</p>

<p align="center">
  Visualize GitHub repository contributors, commit trends, and growth over time.<br/>
  Search any public repo — no sign-in required.
</p>

---

## Features

### Core
- **Contributor list** — ranked by commit count with avatars and first contribution date
- **Period filter** — 1M / 3M / 6M / 1Y / MAX
- **Commit bar chart** — top 20 contributors at a glance
- **Growth chart** — cumulative unique contributors over time
- **Bot filter** — hide bots and automation accounts
- **Contributor search** — filter by username

### Exploration
- **Contributor drawer** — click any contributor to see their GitHub profile, top repos, and PR/issue counts in the repo
- **PR & Issue stats** — per-contributor PR and issue counts fetched live from GitHub Search API
- **Repo health score** — bus factor, contributor diversity (HHI), and 4-week activity trend at a glance
- **Contribution heatmap** — GitHub-style 52-week commit calendar, filterable by top contributors
- **CSV export** — download contributor data as a spreadsheet
- **Repo comparison** — compare two repositories side-by-side (`/compare`)
- **Favorites & history** — star repos and revisit recent searches (stored locally)

### Sharing
- **URL persistence** — period filter syncs to URL for shareable links
- **OG share image** — generate a custom card of selected contributors to share on social media
- **README badge** — embed a live contributor count badge in your repo

### Auth
- **GitHub OAuth** — sign in for 5,000 req/h (vs 60/h unauthenticated)
- **Personal token fallback** — enter your token directly if OAuth is not configured

---

## Getting started

```bash
git clone https://github.com/croc100/gcv.git
cd gcv
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search for any public repo, e.g. `vercel/next.js`.

---

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values.

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No | Server-side default token. Raises the limit for all users even without sign-in. |
| `GITHUB_CLIENT_ID` | No* | GitHub OAuth App Client ID. Enables "Sign in with GitHub". |
| `GITHUB_CLIENT_SECRET` | No* | GitHub OAuth App Client Secret. |
| `JWT_SECRET` | No* | Secret for signing auth cookies. Generate: `openssl rand -hex 32` |

\*All three required together to enable OAuth login.

### Setting up GitHub OAuth (optional but recommended)

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set **Homepage URL** to your deployment URL
3. Set **Authorization callback URL** to `https://your-domain.com/api/auth/callback`
4. Copy the **Client ID** and generate a **Client Secret**
5. Add all three variables to your environment

For local development use `http://localhost:3000/api/auth/callback` as the callback URL.

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variables in **Settings → Environment Variables**
4. Deploy — every push to `main` auto-deploys

---

## Stack

| | |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| GitHub API | [Octokit](https://github.com/octokit/rest.js) |
| Charts | [Recharts](https://recharts.org) |
| Auth | GitHub OAuth + JWT ([jose](https://github.com/panva/jose)) |
| Deployment | Vercel |

---

## Roadmap

- [x] PR & Issue contribution stats per contributor
- [x] CSV data export
- [x] Contribution heatmap (commit calendar)
- [x] Repo health score — bus factor, diversity, activity trend
- [x] First-time contributor highlight
- [ ] Org dashboard — top contributors across all repos in an org

---

## Contributing

PRs and issues are welcome. Please open an issue first for significant changes.

## License

[MIT](LICENSE)
