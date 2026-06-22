import os
import json
import base64
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class GithubInternsScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="GitHub Internships (Simplify)",
            source_url="https://api.github.com/repos/SimplifyJobs/Summer2026-Internships/readme"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/vnd.github.v3+json"
        }

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data from {self.source_url}...")
        self._raw_response = self.fetch_with_retries(self.source_url, headers=self.headers)

    def parse(self):
        if not self._raw_response: return
        print(f"[{self.platform_name}] Parsing README Markdown/HTML...")
        
        try:
            data = self._raw_response.json()
            if 'content' not in data: return
            
            readme_content = base64.b64decode(data['content']).decode('utf-8')
            soup = BeautifulSoup(readme_content, 'html.parser')
            
            # The Simplify repo uses an HTML table inside the markdown.
            rows = soup.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 4:
                    company = cols[0].text.strip().replace('↳', '').strip()
                    role = cols[1].text.strip()
                    location = cols[2].text.strip()
                    app_html = str(cols[3])
                    
                    # If it's closed, there's usually a lock emoji in the application column or role
                    is_closed = '🔒' in app_html or '🔒' in role or 'Closed' in app_html
                    
                    # Extract URL from application column if available, else just link to repo
                    url = "https://github.com/SimplifyJobs/Summer2026-Internships"
                    a_tag = cols[3].find('a', href=True)
                    if a_tag:
                        url = a_tag['href']
                        
                    if company and role and "intern" in role.lower() and not is_closed:
                        raw_event = {
                            "title": f"{role} at {company}",
                            "url": url,
                            "address_data": {"raw": location},
                            "event_type": "Internship/Job",
                            "organizer": company
                        }
                        self.raw_data.append(raw_event)
            
            print(f"[{self.platform_name}] Extracted {len(self.raw_data)} upcoming internships.")
        except Exception as e:
            print(f"[{self.platform_name}] Error parsing GitHub README: {e}")

if __name__ == "__main__":
    s = GithubInternsScraper()
    s.run()
