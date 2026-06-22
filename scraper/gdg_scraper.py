import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class GDGScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Google Developer Groups (GDG)",
            source_url="https://gdg.community.dev/events/"
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
        
        # GDG usually has an inline script or div with data-react-props
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
                            "url": "https://gdg.community.dev" + ev.get('url', ''),
                            "start_date": ev.get('start_date', ''),
                            "end_date": ev.get('end_date', ''),
                            "address_data": ev.get('venue', {}),
                            "event_type": "Meetup/Workshop",
                            "organizer": "GDG"
                        }
                        self.raw_data.append(raw_event)
            except Exception as e:
                print(f"[{self.platform_name}] Error parsing JSON: {e}")
        else:
            # Fallback to HTML parsing if not NextJS
            for el in soup.find_all('a', class_='picture-bg'):
                title = el.get('title', 'GDG Event')
                url = el.get('href', '')
                if url.startswith('/'): url = "https://gdg.community.dev" + url
                raw_event = {
                    "title": title,
                    "url": url,
                    "event_type": "Meetup",
                    "organizer": "GDG"
                }
                self.raw_data.append(raw_event)
                
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = GDGScraper()
    s.run()
