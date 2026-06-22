import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class MeetupScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Meetup",
            source_url="https://www.meetup.com/find/?keywords=tech&source=EVENTS"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data from {self.source_url}...")
        self._raw_response = self.fetch_with_retries(self.source_url, headers=self.headers)
        
        if not self._raw_response:
            print(f"[{self.platform_name}] Could not fetch data. Anti-bot protection likely active.")
            return

    def parse(self):
        if not self._raw_response:
            return
            
        print(f"[{self.platform_name}] Parsing NEXT_DATA from HTML...")
        soup = BeautifulSoup(self._raw_response.text, 'html.parser')
        
        script_tag = soup.find('script', id='__NEXT_DATA__')
        if not script_tag:
            print(f"[{self.platform_name}] __NEXT_DATA__ block not found. Meetup may have blocked the request or changed structure.")
            return

        try:
            data = json.loads(script_tag.string)
            # The exact path to Apollo state varies, typically:
            apollo_state = data.get('props', {}).get('pageProps', {}).get('__APOLLO_STATE__', {})
            
            # Extract Event entities
            for key, val in apollo_state.items():
                if key.startswith('Event:'):
                    title = val.get('title', '')
                    if title:
                        raw_event = {
                            "title": title,
                            "description": val.get('description', ''),
                            "url": val.get('eventUrl', self.source_url),
                            "start_date": val.get('dateTime', ''),
                            "end_date": val.get('endTime', ''),
                            "mode": "Online" if val.get('isOnline') else "Offline",
                            "cover_image": val.get('imageUrl', ''),
                            "event_type": "Meetup/Conference"
                        }
                        self.raw_data.append(raw_event)
                        
            print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events via NEXT_DATA.")
        except Exception as e:
            print(f"[{self.platform_name}] Error parsing __NEXT_DATA__: {e}")

if __name__ == "__main__":
    scraper = MeetupScraper()
    scraper.run()
