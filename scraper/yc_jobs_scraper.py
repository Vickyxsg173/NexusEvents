import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class YCJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Y Combinator",
            source_url="https://www.ycombinator.com/jobs"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data from {self.source_url}...")
        self._raw_response = self.fetch_with_retries(self.source_url, headers=self.headers)

    def parse(self):
        if not self._raw_response: return
        print(f"[{self.platform_name}] Parsing HTML data...")
        soup = BeautifulSoup(self._raw_response.text, 'html.parser')
        
        # YC uses react/nextjs, look for data dict
        script_tag = soup.find('script', class_='js-react-on-rails-component')
        if script_tag:
            try:
                data = json.loads(script_tag.string)
                jobs = data.get('jobs', [])
                if not jobs and 'company' in data:
                    jobs = data.get('company', {}).get('jobs', [])
                    
                # if structure changed, try to find in DOM
                for job in jobs:
                    title = job.get('title', '')
                    if title and ('intern' in title.lower() or 'engineer' in title.lower()):
                        raw_event = {
                            "title": title,
                            "url": "https://www.ycombinator.com/jobs/role/" + job.get('slug', ''),
                            "event_type": "Internship/Job",
                            "organizer": job.get('companyName', 'YC Startup')
                        }
                        self.raw_data.append(raw_event)
            except Exception as e:
                print(f"[{self.platform_name}] Error parsing JSON: {e}")
        
        if not self.raw_data:
            for job_div in soup.find_all('div', class_='job-name'):
                title_el = job_div.find('a')
                if title_el:
                    raw_event = {
                        "title": title_el.text.strip(),
                        "url": "https://www.ycombinator.com" + title_el['href'],
                        "event_type": "Internship/Job",
                        "organizer": "YC Startup"
                    }
                    self.raw_data.append(raw_event)
                    
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = YCJobsScraper()
    s.run()
