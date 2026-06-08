# GCV — GitHub Contributor Viewer

Visualize GitHub repository contributors, commit trends, and contributor growth over time.

## Features

- **Contributor list** — ranked by commit count with avatars and first contribution date
- **Period filter** — 1M / 3M / 6M / 1Y / MAX
- **Commit bar chart** — top 20 contributors at a glance
- **Growth chart** — cumulative unique contributors over time
- **GitHub token support** — set your token in-browser (localStorage) to raise the rate limit to 5,000 req/h

## Stack

- [Next.js 14](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [Octokit](https://github.com/octokit/rest.js)
- [Recharts](https://recharts.org)

## Getting started

```bash
git clone https://github.com/<your-username>/gcv.git
cd gcv
npm install
cp .env.local.example .env.local   # optionally add a server-side token
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search for any public repo, e.g. `vercel/next.js`.

## Environment variables

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | Server-side default token. Without it, GitHub's unauthenticated limit (60 req/h) applies. |

Users can also set their own token via the **token button** in the UI — it's stored only in their browser's `localStorage` and sent as a request header to the API proxy.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. Add `GITHUB_TOKEN` in **Settings → Environment Variables**.
4. Deploy — every push to `main` auto-deploys.

## Roadmap (v2)

- [ ] Compare multiple repos side-by-side
- [ ] First-time contributor highlight
- [ ] Cumulative contributor growth graph (standalone page)

## Contributing

PRs and issues are welcome. Please open an issue first for significant changes.

## License

[MIT](LICENSE)
