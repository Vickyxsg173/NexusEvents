import os
import json
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class Hack2SkillScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Hack2Skill",
            source_url="https://hack2skill.com/hackathons"
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
        
        script_tag = soup.find('script', id='__NEXT_DATA__')
        if script_tag:
            try:
                data = json.loads(script_tag.string)
                events = data.get('props', {}).get('pageProps', {}).get('hackathons', [])
                for ev in events:
                    title = ev.get('title', '')
                    if title:
                        raw_event = {
                            "title": title,
                            "description": ev.get('description', ''),
                            "url": "https://hack2skill.com/hackathon/" + ev.get('slug', ''),
                            "start_date": ev.get('start_date', ''),
                            "end_date": ev.get('end_date', ''),
                            "cover_image": ev.get('banner', ''),
                            "event_type": "Hackathon",
                            "organizer": "Hack2Skill"
                        }
                        self.raw_data.append(raw_event)
            except Exception as e:
                print(f"[{self.platform_name}] Error parsing JSON: {e}")
        else:
            # Fallback
            for card in soup.find_all('div', class_='hackathon-card'):
                title = card.find('h3')
                url = card.find('a', href=True)
                if title and url:
                    raw_event = {
                        "title": title.text.strip(),
                        "url": "https://hack2skill.com" + url['href'] if url['href'].startswith('/') else url['href'],
                        "event_type": "Hackathon",
                        "organizer": "Hack2Skill"
                    }
                    self.raw_data.append(raw_event)

        print(f"[{self.platform_name}] Extracted {len(self.raw_data)} raw events.")

if __name__ == "__main__":
    s = Hack2SkillScraper()
    s.run()
