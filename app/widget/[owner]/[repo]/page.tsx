
type Contributor = { login: string; avatar_url: string; html_url: string; contributions: number };

async function getContributors(owner: string, repo: string): Promise<Contributor[]> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = { "User-Agent": "gcv-widget" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=12&anon=false`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: { owner: string; repo: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const { owner, repo } = params;
  const limit = Math.min(parseInt(searchParams.limit ?? "12"), 24);
  const contributors = (await getContributors(owner, repo)).slice(0, limit);
  const total = contributors.reduce((s, c) => s + c.contributions, 0);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #e6edf3; }
          .widget { padding: 16px; }
          .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
          .title { font-size: 12px; font-weight: 600; color: #7d8590; }
          .repo-name { font-size: 13px; font-weight: 700; color: #e6edf3; }
          .grid { display: flex; flex-wrap: wrap; gap: 8px; }
          .contributor { display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; width: 56px; }
          .avatar { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #30363d; }
          .login { font-size: 9px; color: #7d8590; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
          .commits { font-size: 9px; color: #484f58; }
          .footer { margin-top: 12px; padding-top: 10px; border-top: 1px solid #21262d; display: flex; align-items: center; justify-content: space-between; }
          .footer a { font-size: 10px; color: #484f58; text-decoration: none; }
          .footer a:hover { color: #388bfd; }
          .total { font-size: 10px; color: #484f58; }
        `}</style>
      </head>
      <body>
        <div className="widget">
          <div className="header">
            <div>
              <div className="title">Contributors</div>
              <div className="repo-name">{owner}/{repo}</div>
            </div>
            <div className="total">{contributors.length} shown · {total.toLocaleString()} commits</div>
          </div>
          <div className="grid">
            {contributors.map((c) => (
              <a
                key={c.login}
                href={`https://gcv-five.vercel.app/u/${c.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contributor"
                title={`${c.login} — ${c.contributions} commits`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar_url} alt={c.login} className="avatar" width={40} height={40} />
                <span className="login">{c.login}</span>
                <span className="commits">{c.contributions}</span>
              </a>
            ))}
          </div>
          <div className="footer">
            <a href={`https://gcv-five.vercel.app/${owner}/${repo}`} target="_blank" rel="noopener noreferrer">
              View full stats on GCV →
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: { params: { owner: string; repo: string } }) {
  return { title: `${params.owner}/${params.repo} contributors — GCV` };
}
