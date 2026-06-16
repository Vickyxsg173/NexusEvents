import requests
from base_scraper import BaseScraper

class HackerEarthScraper(BaseScraper):
    def __init__(self):
        super().__init__(platform_name="HackerEarth", source_url="https://www.hackerearth.com/chrome-extension/events/")

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data...")
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
            response = requests.get(self.source_url, headers=headers)
            if response.status_code == 200:
                self._raw_response = response.json()
            else:
                print(f"[{self.platform_name}] Error: Status code {response.status_code}")
                self._raw_response = {}
        except Exception as e:
            print(f"[{self.platform_name}] Fetch error: {e}")
            self._raw_response = {}

    def parse(self):
        print(f"[{self.platform_name}] Parsing data...")
        self.raw_data = []
        
        try:
            items = self._raw_response.get("response", [])
            for item in items:
                # We simply append the rich object directly so Gemini can extract perfectly.
                self.raw_data.append({
                    "title": item.get("title", ""),
                    "description": item.get("description", ""),
                    "url": item.get("url", ""),
                    "start_date": item.get("start_utc_tz", item.get("start_tz", "")),
                    "end_date": item.get("end_utc_tz", item.get("end_tz", "")),
                    "cover_image": item.get("cover_image", item.get("thumbnail", "")),
                    "mode": "Online" if item.get("status") == "ONGOING" or item.get("status") == "UPCOMING" else "Online",
                    "event_type": item.get("challenge_type", "")
                })
        except Exception as e:
            print(f"[{self.platform_name}] Parse error: {e}")
            
        print(f"[{self.platform_name}] Parsed {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    scraper = HackerEarthScraper()
    scraper.run()
