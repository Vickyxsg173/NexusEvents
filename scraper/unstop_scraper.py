import requests
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class UnstopScraper(BaseScraper):
    def __init__(self):
        # Using a direct search URL or an API endpoint if we can find it
        super().__init__(platform_name="Unstop", source_url="https://unstop.com/hackathons")
        self.api_url = "https://unstop.com/api/public/opportunity/search-result"
        
    def fetch(self):
        print(f"[{self.platform_name}] Fetching data...")
        # Most modern platforms like Unstop use internal APIs rather than static HTML.
        # We will attempt to use requests to hit their public search API as a demonstration.
        try:
            # Note: APIs change frequently. This is a generic implementation.
            payload = {
                "opportunity": "hackathons",
                "page": 1,
                "per_page": 50
            }
            # Add basic headers to avoid immediate 403s
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
            response = requests.get(self.api_url, params=payload, headers=headers)
            
            if response.status_code == 200:
                self._raw_response = response.json()
            else:
                print(f"[{self.platform_name}] Warning: Received status {response.status_code}. Using mock data for architecture demonstration.")
                self._raw_response = {"data": {"data": [{"title": "Mock Unstop Hackathon", "seo_url": "mock-url"}]}}
        except Exception as e:
            print(f"[{self.platform_name}] Fetch error: {e}")
            self._raw_response = {}

    def parse(self):
        print(f"[{self.platform_name}] Parsing data...")
        self.raw_data = []
        
        # Extract from API JSON structure
        try:
            # Safely navigate the assumed JSON structure
            items = self._raw_response.get("data", {}).get("data", [])
            for item in items:
                # Extract URL properly. Unstop API sometimes returns absolute URL in seo_url.
                seo_url = item.get('seo_url', '')
                event_url = seo_url if seo_url.startswith('http') else f"https://unstop.com/{seo_url}"
                
                self.raw_data.append({
                    "title": item.get("title", ""),
                    "description": item.get("public_desc", ""),
                    "url": event_url,
                    "organization": item.get("organization", ""),
                    "start_date": item.get("start_date", ""),
                    "end_date": item.get("end_date", ""),
                    "cover_image": item.get("logoUrl2", item.get("logoUrl", "")),
                    "address_data": item.get("address_with_country_logo", {}),
                    "registration_data": item.get("regnRequirements", {}),
                    "skills": [s.get('skill_name') for s in item.get("required_skills", [])],
                    "work_functions": [w.get('name') for w in item.get("workfunction", [])]
                })
        except Exception as e:
            print(f"[{self.platform_name}] Parse error: {e}")
            
        print(f"[{self.platform_name}] Parsed {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    scraper = UnstopScraper()
    scraper.run()
