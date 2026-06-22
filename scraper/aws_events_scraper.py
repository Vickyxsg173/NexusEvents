import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class AWSEventsScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="AWS Events",
            source_url="https://aws.amazon.com/events/"
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
        
        # AWS typically stores event data in JSON or specific tags
        for el in soup.find_all('div', class_='event-card'):
            title = el.find('h3')
            url = el.find('a', href=True)
            if title and url:
                raw_event = {
                    "title": title.text.strip(),
                    "url": "https://aws.amazon.com" + url['href'] if url['href'].startswith('/') else url['href'],
                    "event_type": "Conference",
                    "organizer": "Amazon Web Services"
                }
                self.raw_data.append(raw_event)
                
        # If the direct class isn't found, try getting all links that look like events
        if not self.raw_data:
            for a in soup.find_all('a', href=True):
                if '/events/' in a['href'] and len(a.text.strip()) > 10:
                    raw_event = {
                        "title": a.text.strip(),
                        "url": "https://aws.amazon.com" + a['href'] if a['href'].startswith('/') else a['href'],
                        "event_type": "Event",
                        "organizer": "Amazon Web Services"
                    }
                    # avoid nav links
                    if "Contact" not in raw_event["title"] and "Sign In" not in raw_event["title"]:
                        self.raw_data.append(raw_event)
                        
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = AWSEventsScraper()
    s.run()
