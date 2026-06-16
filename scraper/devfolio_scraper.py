import requests
from base_scraper import BaseScraper

class DevfolioScraper(BaseScraper):
    def __init__(self):
        super().__init__(platform_name="Devfolio", source_url="https://api.devfolio.co/api/hackathons?page=1&limit=50")

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data...")
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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
            items = self._raw_response.get("result", []) if isinstance(self._raw_response, dict) else self._raw_response
            for item in items:
                self.raw_data.append({
                    "title": item.get("name", ""),
                    "description": item.get("desc", ""),
                    "url": f"https://{item.get('slug', '')}.devfolio.co",
                    "mode": item.get("type", "Online"),
                    "start_date": item.get("starts_at", ""),
                    "end_date": item.get("ends_at", ""),
                    "cover_image": item.get("cover_img", item.get("favicon", ""))
                })
        except Exception as e:
            print(f"[{self.platform_name}] Parse error: {e}")
            
        print(f"[{self.platform_name}] Parsed {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    scraper = DevfolioScraper()
    scraper.run()
