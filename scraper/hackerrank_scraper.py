import requests
from base_scraper import BaseScraper

class HackerRankScraper(BaseScraper):
    def __init__(self):
        super().__init__(platform_name="HackerRank", source_url="https://www.hackerrank.com/rest/contests/college?limit=50")

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
            items = self._raw_response.get("models", [])
            for item in items:
                # Provide rich data to Gemini for extraction
                self.raw_data.append({
                    "title": item.get("name", ""),
                    "description": item.get("description", item.get("description_html", "")),
                    "url": f"https://www.hackerrank.com/contests/{item.get('slug', '')}",
                    "start_date": item.get("get_starttimeiso", ""),
                    "end_date": item.get("get_endtimeiso", ""),
                    "organization": item.get("organization_name", ""),
                    "event_type": "Competition"
                })
        except Exception as e:
            print(f"[{self.platform_name}] Parse error: {e}")
            
        print(f"[{self.platform_name}] Parsed {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    scraper = HackerRankScraper()
    scraper.run()
