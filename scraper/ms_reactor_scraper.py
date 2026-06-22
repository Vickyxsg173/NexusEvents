import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class MSReactorScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Microsoft Reactor",
            source_url="https://developer.microsoft.com/en-us/reactor/"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data from {self.source_url}...")
        self._raw_response = self.fetch_with_retries(self.source_url, headers=self.headers)

    def parse(self):
        if not self._raw_response: return
        print(f"[{self.platform_name}] Parsing HTML data...")
        soup = BeautifulSoup(self._raw_response.text, 'html.parser')
        
        # MS uses nextjs
        script_tag = soup.find('script', id='__NEXT_DATA__')
        if script_tag:
            try:
                data = json.loads(script_tag.string)
                events = data.get('props', {}).get('pageProps', {}).get('events', [])
                for ev in events:
                    title = ev.get('title', '')
                    if title:
                        raw_event = {
                            "title": title,
                            "description": ev.get('description', ''),
                            "url": ev.get('url', self.source_url),
                            "start_date": ev.get('startDateTime', ''),
                            "event_type": "Webinar",
                            "organizer": "Microsoft"
                        }
                        self.raw_data.append(raw_event)
            except Exception as e:
                print(f"[{self.platform_name}] Error parsing JSON: {e}")
        else:
            print(f"[{self.platform_name}] No __NEXT_DATA__ found. Relying on AI Fallback if raw text is provided.")
            
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = MSReactorScraper()
    s.run()
