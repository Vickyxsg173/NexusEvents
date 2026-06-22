import requests
import base64

repos = ["speedyapply/2026-SWE-College-Jobs", "vanshb03/Summer2026-Internships"]
for repo in repos:
    r = requests.get(f"https://api.github.com/repos/{repo}/readme", headers={"Accept": "application/vnd.github.v3+json"})
    data = r.json()
    content = base64.b64decode(data['content']).decode('utf-8')
    print(f"--- {repo} ---")
    print(content[:500])
    
    # Let's find table rows
    lines = content.split('\n')
    table_lines = [l for l in lines if '|' in l and ('Company' in l or 'Role' in l or 'Location' in l or 'Apply' in l)]
    print(f"Table headers found: {table_lines}")

