# GCV — GitHub Community Vitals

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" />
  <a href="https://gcv-five.vercel.app"><img src="https://img.shields.io/badge/live-gcv--five.vercel.app-brightgreen" alt="Live" /></a>
  <a href="https://gcv-five.vercel.app/croc100/gcv"><img src="https://gcv-five.vercel.app/api/badge/health/croc100/gcv" alt="GCV Health" /></a>
</p>

<p align="center">
  Discover trending repos, explore open source communities, and analyze contributor health across GitHub.<br/>
  No sign-in required to get started.
</p>

---

## Features

### Repo analytics (`/[owner]/[repo]`)
- Contributor list ranked by commit count with avatars and first contribution date
- **New contributor badge** — highlights contributors who made their first commit in the last 90 days
- **Commit heatmap** — GitHub-style 52-week calendar, filterable by top contributor
- **Repo health score** — composite 0–100 score: bus factor (40%), contributor diversity/HHI (40%), 4-week activity trend (20%)
- Period filter — 1M / 3M / 6M / 1Y / MAX
- Commit bar chart, growth chart, bot filter, CSV export
- **Contributor drawer** — click any contributor for their GitHub profile, top repos, and per-repo PR/issue counts

### Discovery
- **Trending** (`/trending`) — most starred repos pushed this week, filterable by language
- **Explore** (`/explore`) — active repos with good first issues for new contributors
- **Compare** (`/compare`) — side-by-side stats for two repos
- **Org dashboard** (`/org/[org]`) — contributor leaderboard across all repos in an organization

### Profiles
- **Contributor profile** (`/u/[login]`) — recent activity, active repos, language breakdown, commit sparkline
- **GCV Wrapped** (`/wrapped/[login]`) — shareable year-in-review card

### Sharing & embedding
- **Embed widget** (`/widget/[owner]/[repo]`) — iframe-embeddable contributor grid with 1h cache
- **README badge** — live contributor count badge, auto-updates hourly ([badge generator →](https://gcv-five.vercel.app/badge))
- **OG share image** — custom social card for any repo
- URL persistence — all filters sync to URL

### README badge

Add a live contributors count badge to any repository's README:

```markdown
[![Contributors](https://gcv-five.vercel.app/api/badge/owner/repo)](https://gcv-five.vercel.app/owner/repo)
```

Replace `owner/repo` with your repository. The badge auto-updates every hour and links back to your GCV dashboard.

Use the [badge generator](https://gcv-five.vercel.app/badge) for a live preview and one-click copy.

### Promote your repo
- **Sponsored listings** (`/promote`) — feature your repo on Trending, Explore, and the homepage
- Powered by Stripe + Vercel KV

### Auth
- **GitHub OAuth** — sign in for 5,000 req/h (vs 60/h unauthenticated)

---

## Getting started

```bash
git clone https://github.com/croc100/gcv.git
cd gcv
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search any public repo, e.g. `vercel/next.js`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | No | Server-side default token. Raises rate limit for all users. |
| `GITHUB_CLIENT_ID` | No* | GitHub OAuth App Client ID. |
| `GITHUB_CLIENT_SECRET` | No* | GitHub OAuth App Client Secret. |
| `JWT_SECRET` | No* | Cookie signing secret — `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | No† | Stripe secret key for promoted repos. |
| `STRIPE_WEBHOOK_SECRET` | No† | Stripe webhook signing secret. |
| `NEXT_PUBLIC_BASE_URL` | No† | Full deployment URL, e.g. `https://gcv-five.vercel.app` |
| `KV_REST_API_URL` | No† | Auto-set when Vercel KV store is linked. |
| `KV_REST_API_TOKEN` | No† | Auto-set when Vercel KV store is linked. |

\* All three required together to enable GitHub OAuth.  
† All required together to enable promoted repos.

### GitHub OAuth setup

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Callback URL: `https://your-domain.com/api/auth/callback`
3. Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET` to env

For local dev: `http://localhost:3000/api/auth/callback`

### Promoted repos setup

1. Create a [Vercel KV](https://vercel.com/docs/storage/vercel-kv) store and link it to your project
2. Register a Stripe webhook at `https://your-domain.com/api/promote/webhook` → event: `checkout.session.completed`
3. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL` to env

---

## Deployment

1. Push to GitHub and import on [vercel.com](https://vercel.com)
2. Add environment variables in Settings → Environment Variables
3. Every push to `main` auto-deploys

---

## Stack

| | |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| GitHub API | Octokit |
| Charts | Recharts |
| Auth | GitHub OAuth + JWT (jose) |
| Payments | Stripe |
| Storage | Vercel KV (Redis) |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

---

## Contributing

PRs and issues welcome. Open an issue first for significant changes.

## License

[MIT](LICENSE)
