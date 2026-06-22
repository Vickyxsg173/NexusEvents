import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class YCJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Y Combinator",
            source_url="https://news.ycombinator.com/jobs"
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
        
        # Hacker News jobs board is pure HTML
        titlelines = soup.find_all('span', class_='titleline')
        
        for titleline in titlelines:
            a_tag = titleline.find('a')
            if a_tag:
                title = a_tag.text.strip()
                url = a_tag.get('href', '')
                if url.startswith('item?id='):
                    url = "https://news.ycombinator.com/" + url
                    
                raw_event = {
                    "title": title,
                    "url": url,
                    "event_type": "Internship/Job",
                    "organizer": "YC Startup"
                }
                self.raw_data.append(raw_event)
                
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = YCJobsScraper()
    s.run()
