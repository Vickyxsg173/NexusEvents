import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class GDGScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Google Developer Groups (GDG)",
            source_url="https://gdg.community.dev/api/event/"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Referer": "https://gdg.community.dev/events/"
        }

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data from {self.source_url}...")
        self._raw_response = self.fetch_with_retries(self.source_url, headers=self.headers)

    def parse(self):
        if not self._raw_response: return
        print(f"[{self.platform_name}] Parsing JSON data...")
        
        try:
            data = self._raw_response.json()
            events = data.get('results', [])
            
            for ev in events:
                title = ev.get('title', '')
                if title:
                    url = ev.get('url', '')
                    if url and not url.startswith('http'):
                        url = "https://gdg.community.dev" + url
                    
                    # Convert GDG event mode format
                    mode = "Offline"
                    if ev.get('event_type_title') == 'Virtual':
                        mode = "Online"
                        
                    raw_event = {
                        "title": title,
                        "description": ev.get('description_short', ''),
                        "url": url,
                        "start_date": ev.get('start_date', ''),
                        "end_date": ev.get('end_date', ''),
                        "cover_image": ev.get('picture', {}).get('url', ''),
                        "mode": mode,
                        "address_data": {"raw": ev.get('city', '')},
                        "event_type": "Meetup/Workshop",
                        "organizer": "GDG"
                    }
                    self.raw_data.append(raw_event)
                    
        except Exception as e:
            print(f"[{self.platform_name}] Error parsing JSON: {e}")
                
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = GDGScraper()
    s.run()
