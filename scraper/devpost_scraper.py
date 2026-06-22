import os
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class DevpostScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Devpost",
            source_url="https://devpost.com/hackathons"
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
        print(f"[{self.platform_name}] Parsing HTML data...")
        soup = BeautifulSoup(self._raw_response.text, 'html.parser')
        
        hackathons = soup.find_all('div', class_='hackathon-tile')
        for hack in hackathons:
            title_el = hack.find('h3')
            url_el = hack.find('a', href=True)
            img_el = hack.find('img', class_='hackathon-thumbnail')
            date_el = hack.find('div', class_='submission-period')
            loc_el = hack.find('div', class_='info') # Often contains location info
            
            title = title_el.text.strip() if title_el else ""
            url = url_el['href'] if url_el else self.source_url
            cover_image = img_el.get('src', '') if img_el else ""
            date_text = date_el.text.strip() if date_el else ""
            
            if title:
                raw_event = {
                    "title": title,
                    "description": f"Devpost Hackathon - {title}",
                    "url": url,
                    "cover_image": cover_image,
                    "address_data": {"raw": "Online" if "Online" in hack.text else "In-Person"},
                    "start_date": date_text,
                    "event_type": "Hackathon",
                    "organizer": "Devpost Community"
                }
                self.raw_data.append(raw_event)
                
        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = DevpostScraper()
    s.run()
