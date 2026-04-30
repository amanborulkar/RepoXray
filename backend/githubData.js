export async function fetchGitHubData(owner, repo) {
  const token = process.env.GITHUB_TOKEN;
  const h = {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const results = await Promise.allSettled([
    fetch(base, { headers: h }),                                               // 0 repo info
    fetch(`${base}/contributors?per_page=12`, { headers: h }),                 // 1 contributors
    fetch(`${base}/languages`, { headers: h }),                                // 2 languages
    fetch(`${base}/commits?per_page=10`, { headers: h }),                      // 3 commits
    fetch(`${base}/releases?per_page=5`, { headers: h }),                      // 4 releases
    fetch(`${base}/issues?state=open&per_page=8`, { headers: h }),             // 5 open issues
    fetch(`${base}/pulls?state=open&per_page=8`, { headers: h }),              // 6 open PRs
    fetch(`${base}/branches`, { headers: h }),                                 // 7 branches
    fetch(`${base}/stats/commit_activity`, { headers: h }),                    // 8 weekly commit activity
    fetch(`${base}/topics`, { headers: {                                       // 9 topics (needs special header)
      ...h, Accept: "application/vnd.github.mercy-preview+json"
    }}),
  ]);

  // Safely parse each response
  const jsons = await Promise.all(
    results.map(r =>
      r.status === "fulfilled"
        ? r.value.json().catch(() => null)
        : null
    )
  );

  const [info, contributors, languages, commits, releases, issues, pulls, branches, activity, topicsRes] = jsons;

  // ── Language percentages ──────────────────────────────────────────────────
  const totalBytes = languages
    ? Object.values(languages).reduce((a, b) => Number(a) + Number(b), 0)
    : 1;
  const langPct = languages
    ? Object.fromEntries(
        Object.entries(languages)
          .sort(([, a], [, b]) => Number(b) - Number(a))
          .map(([k, v]) => [k, ((Number(v) / Number(totalBytes)) * 100).toFixed(1) + "%"])
      )
    : {};

  // ── Weekly commit counts (last 12 weeks) ─────────────────────────────────
  const weeklyCommits = Array.isArray(activity)
    ? activity.slice(-12).map(w => w.total)
    : [];

  return {
    meta: {
      name:          info?.name             ?? null,
      fullName:      info?.full_name        ?? `${owner}/${repo}`,
      description:   info?.description     ?? null,
      stars:         info?.stargazers_count ?? 0,
      forks:         info?.forks_count      ?? 0,
      watchers:      info?.watchers_count   ?? 0,
      openIssues:    info?.open_issues_count ?? 0,
      defaultBranch: info?.default_branch  ?? "main",
      createdAt:     info?.created_at       ?? null,
      pushedAt:      info?.pushed_at        ?? null,
      size:          info?.size             ?? 0,       // in KB
      license:       info?.license?.name   ?? "None",
      topics:        topicsRes?.names ?? info?.topics ?? [],
      homepage:      info?.homepage         ?? null,
      visibility:    info?.visibility       ?? "public",
      isArchived:    info?.archived         ?? false,
      isFork:        info?.fork             ?? false,
      subscribers:   info?.subscribers_count ?? 0,
      network:       info?.network_count    ?? 0,
    },

    languages: langPct,

    contributors: Array.isArray(contributors)
      ? contributors.map(c => ({
          login:         c.login,
          avatar:        c.avatar_url,
          contributions: c.contributions,
          url:           c.html_url,
        }))
      : [],

    recentCommits: Array.isArray(commits)
      ? commits.map(c => ({
          sha:     c.sha?.slice(0, 7),
          message: c.commit?.message?.split("\n")[0] ?? "",
          author:  c.commit?.author?.name ?? "",
          date:    c.commit?.author?.date ?? null,
          url:     c.html_url,
        }))
      : [],

    releases: Array.isArray(releases)
      ? releases.map(r => ({
          name:        r.name || r.tag_name,
          tag:         r.tag_name,
          publishedAt: r.published_at,
          prerelease:  r.prerelease,
          body:        r.body?.slice(0, 160) ?? null,
          url:         r.html_url,
        }))
      : [],

    openIssues: Array.isArray(issues)
      ? issues.map(i => ({
          number:    i.number,
          title:     i.title,
          labels:    i.labels?.map(l => l.name) ?? [],
          createdAt: i.created_at,
          user:      i.user?.login ?? "",
          url:       i.html_url,
        }))
      : [],

    openPRs: Array.isArray(pulls)
      ? pulls.map(p => ({
          number:    p.number,
          title:     p.title,
          user:      p.user?.login ?? "",
          createdAt: p.created_at,
          url:       p.html_url,
        }))
      : [],

    branches: Array.isArray(branches)
      ? branches.map(b => b.name)
      : [],

    weeklyCommits,
  };
}

