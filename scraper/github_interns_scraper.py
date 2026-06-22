import os
import re
import json
import base64
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class GithubInternsScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="GitHub Internships",
            source_url="https://api.github.com/repos/SimplifyJobs/Summer2026-Internships/readme"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/vnd.github.v3+json"
        }
        self.repos = [
            "SimplifyJobs/Summer2026-Internships",
            "speedyapply/2026-SWE-College-Jobs",
            "vanshb03/Summer2026-Internships"
        ]

    def fetch(self):
        self._raw_responses = {}
        for repo in self.repos:
            url = f"https://api.github.com/repos/{repo}/readme"
            print(f"[{self.platform_name}] Fetching {repo}...")
            resp = self.fetch_with_retries(url, headers=self.headers)
            if resp:
                self._raw_responses[repo] = resp

    def parse(self):
        print(f"[{self.platform_name}] Parsing repositories...")
        for repo, resp in getattr(self, "_raw_responses", {}).items():
            try:
                data = resp.json()
                if 'content' not in data: continue
                
                readme_content = base64.b64decode(data['content']).decode('utf-8')
                
                # Check if it contains an HTML table (like SimplifyJobs)
                if '<tr>' in readme_content and '<td>' in readme_content:
                    self._parse_html_table(repo, readme_content)
                else:
                    self._parse_markdown_table(repo, readme_content)
            except Exception as e:
                print(f"[{self.platform_name}] Error parsing {repo}: {e}")
        
        print(f"[{self.platform_name}] Total internships extracted: {len(self.raw_data)}")

    def _parse_html_table(self, repo, content):
        soup = BeautifulSoup(content, 'html.parser')
        rows = soup.find_all('tr')
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 4:
                company = cols[0].text.strip().replace('↳', '').strip()
                role = cols[1].text.strip()
                location = cols[2].text.strip()
                app_html = str(cols[3])
                
                is_closed = '🔒' in app_html or '🔒' in role or 'Closed' in app_html
                url = f"https://github.com/{repo}"
                a_tag = cols[3].find('a', href=True)
                if a_tag:
                    url = a_tag['href']
                    
                self._add_event(company, role, location, url, is_closed, repo)

    def _parse_markdown_table(self, repo, content):
        lines = content.split('\n')
        current_company = ""
        for line in lines:
            if not line.strip().startswith('|'): continue
            parts = [p.strip() for p in line.split('|') if p.strip()]
            if len(parts) >= 4 and not "Company" in parts[0] and not "---" in parts[0]:
                company = parts[0].replace('↳', '').strip()
                if company and company != "":
                    current_company = company
                else:
                    company = current_company
                
                role = parts[1]
                location = parts[2].replace('</br>', ', ').replace('<br/>', ', ')
                app_col = parts[3]
                
                is_closed = '🔒' in app_col or '🔒' in role or 'Closed' in app_col
                url = f"https://github.com/{repo}"
                
                # Extract URL from markdown or HTML tag in app_col
                # e.g., <a href="link"><img...
                href_match = re.search(r'href=[\'"]?([^\'" >]+)', app_col)
                if href_match:
                    url = href_match.group(1)
                else:
                    # Markdown link: [text](url)
                    md_match = re.search(r'\[.+?\]\((.+?)\)', app_col)
                    if md_match:
                        url = md_match.group(1)
                
                # Cleanup HTML tags from location and role if any
                location = BeautifulSoup(location, "html.parser").get_text()
                role = BeautifulSoup(role, "html.parser").get_text()

                self._add_event(company, role, location, url, is_closed, repo)

    def _add_event(self, company, role, location, url, is_closed, repo):
        # Validation for India/Remote based on user request
        loc_lower = location.lower()
        role_lower = role.lower()
        
        # Only process if open
        if is_closed: return
        if not company or not role: return
        
        # Determine if India/Remote
        is_india_or_remote = ("india" in loc_lower or "remote" in loc_lower or 
                              "bangalore" in loc_lower or "bengaluru" in loc_lower or 
                              "hyderabad" in loc_lower or "pune" in loc_lower or 
                              "gurugram" in loc_lower or "mumbai" in loc_lower or 
                              "delhi" in loc_lower or "noida" in loc_lower or 
                              "chennai" in loc_lower or "anywhere" in loc_lower)
        
        # Fallback: if there's no explicitly defined location, include it to not miss global opportunities
        # But if it explicitly says US/UK without India/Remote, maybe skip. 
        # But for now, since users want global opportunities accessible from India, we just ingest all non-US-exclusive.
        if "🇺🇸" in role or "🇺🇸" in location:
            # Strictly US
            return
            
        raw_event = {
            "title": f"{role} at {company}",
            "url": url,
            "address_data": {"raw": location},
            "event_type": "Internship/Job",
            "organizer": company,
            "source_platform": f"GitHub ({repo.split('/')[0]})"
        }
        self.raw_data.append(raw_event)

if __name__ == "__main__":
    s = GithubInternsScraper()
    s.run()
