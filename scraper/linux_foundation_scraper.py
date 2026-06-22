import os
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class LinuxFoundationScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Linux Foundation",
            source_url="https://events.linuxfoundation.org/"
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
        
        # Look for typical event boxes on LF
        for el in soup.find_all('div', class_='event-box'):
            title_el = el.find('h3')
            url_el = el.find('a', href=True)
            date_el = el.find('div', class_='event-date')
            
            if title_el and url_el:
                raw_event = {
                    "title": title_el.text.strip(),
                    "url": url_el['href'],
                    "start_date": date_el.text.strip() if date_el else "",
                    "event_type": "Conference",
                    "organizer": "Linux Foundation"
                }
                self.raw_data.append(raw_event)
                
        # generic fallback
        if not self.raw_data:
            for article in soup.find_all('article'):
                title = article.find(['h2', 'h3', 'h4'])
                url = article.find('a', href=True)
                if title and url and len(title.text.strip()) > 5:
                    raw_event = {
                        "title": title.text.strip(),
                        "url": url['href'],
                        "event_type": "Conference",
                        "organizer": "Linux Foundation"
                    }
                    self.raw_data.append(raw_event)
                    
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = LinuxFoundationScraper()
    s.run()
