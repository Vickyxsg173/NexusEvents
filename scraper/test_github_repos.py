import requests

repos = [
    "SimplifyJobs/Summer2026-Internships",
    "speedyapply/2026-SWE-College-Jobs",
    "vanshb03/Summer2026-Internships"
]

for repo in repos:
    url = f"https://api.github.com/repos/{repo}/readme"
    headers = {"Accept": "application/vnd.github.v3+json"}
    r = requests.get(url, headers=headers)
    print(f"{repo}: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"  Got content length: {len(data.get('content', ''))}")
