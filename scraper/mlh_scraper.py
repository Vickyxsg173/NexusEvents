import os
import requests
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class MLHScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Major League Hacking (MLH)",
            source_url="https://mlh.io/seasons/2025/events"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }

    def fetch(self):
        print(f"[{self.platform_name}] Fetching data from {self.source_url}...")
        self._raw_response = self.fetch_with_retries(self.source_url, headers=self.headers)
        
        if not self._raw_response:
            raise Exception("Failed to fetch MLH events after retries.")

    def parse(self):
        if not self._raw_response:
            return
            
        print(f"[{self.platform_name}] Parsing HTML data...")
        soup = BeautifulSoup(self._raw_response.text, 'html.parser')
        
        # MLH uses Inertia.js / React, data is embedded in a JSON script tag
        script_tag = soup.find('script', attrs={'data-page': True})
        if not script_tag:
            print(f"[{self.platform_name}] No events JSON found. HTML might have changed.")
            return

        try:
            import json
            data = json.loads(script_tag.string)
            props = data.get('props', {})
            
            # Combine upcoming and past events
            events = props.get('upcomingEvents', []) + props.get('pastEvents', [])
            
            for event in events:
                title = event.get('name', 'Unknown MLH Event')
                date = event.get('dateRange', '')
                location = event.get('location', '')
                url = "https://mlh.io" + event.get('url', '') if event.get('url') else self.source_url
                cover_image = event.get('logoUrl', '') or event.get('backgroundUrl', '')
                
                raw_event = {
                    "title": title,
                    "description": f"MLH Hackathon - {title}",
                    "url": url,
                    "cover_image": cover_image,
                    "address_data": {
                        "raw": location
                    },
                    "start_date": event.get('startsAt', date),
                    "end_date": event.get('endsAt', ''),
                    "event_type": "Hackathon"
                }
                
                self.raw_data.append(raw_event)
                
            print(f"[{self.platform_name}] Parsed {len(self.raw_data)} raw events.")
        except Exception as e:
            print(f"[{self.platform_name}] Failed to parse MLH JSON: {e}")

if __name__ == "__main__":
    scraper = MLHScraper()
    scraper.run()
