import os
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class DevpostScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Devpost",
            source_url="https://devpost.com/api/hackathons"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data from {self.source_url}...")
        self._raw_response = self.fetch_with_retries(self.source_url, headers=self.headers)
        if not self._raw_response:
            print(f"[{self.platform_name}] Could not fetch data.")
            return

    def parse(self):
        if not self._raw_response: return
        print(f"[{self.platform_name}] Parsing JSON data...")
        try:
            data = self._raw_response.json()
            hackathons = data.get('hackathons', [])
            
            for hack in hackathons:
                raw_event = {
                    "title": hack.get('title', ''),
                    "description": "Devpost Hackathon",
                    "url": hack.get('url', ''),
                    "cover_image": hack.get('thumbnail_url', ''),
                    "address_data": {"raw": hack.get('displayed_location', {}).get('location', 'Online')},
                    "start_date": hack.get('submission_period_dates', ''),
                    "event_type": "Hackathon",
                    "organizer": hack.get('organization_name', 'Devpost Community')
                }
                self.raw_data.append(raw_event)
                
            print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")
        except Exception as e:
            print(f"[{self.platform_name}] Failed to parse JSON: {e}")

if __name__ == "__main__":
    s = DevpostScraper()
    s.run()
