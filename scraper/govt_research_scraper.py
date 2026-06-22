import os
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class GovtResearchScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            platform_name="Government & Research (ISRO/DRDO/IIT)",
            source_url="multiple_sources"
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
        
        self.target_urls = [
            "https://www.isro.gov.in/Careers.html",
            "https://internship.aicte-india.org/",
            "https://drdo.gov.in/drdo/careers"
            # Note: Specific IIT portals are not centralized. 
            # We add AICTE here as a generic fallback since its primary portal is highly dynamic.
        ]

    def fetch(self):
        self._raw_responses = {}
        for url in self.target_urls:
            print(f"[{self.platform_name}] Fetching data from {url}...")
            resp = self.fetch_with_retries(url, headers=self.headers)
            if resp:
                self._raw_responses[url] = resp

    def parse(self):
        print(f"[{self.platform_name}] Parsing HTML using AI...")
        
        for url, resp in getattr(self, "_raw_responses", {}).items():
            try:
                soup = BeautifulSoup(resp.text, 'html.parser')
                
                # Remove scripts, styles, and empty tags to save tokens
                for element in soup(["script", "style", "nav", "footer", "header"]):
                    element.extract()
                    
                text_content = soup.get_text(separator=' ', strip=True)
                
                # If text is too long, truncate it to fit context window (approx 6000 words)
                words = text_content.split()
                if len(words) > 6000:
                    text_content = ' '.join(words[:6000])
                
                if len(text_content) < 100:
                    print(f"[{self.platform_name}] Not enough content found on {url}")
                    continue
                
                prompt = f"""
You are an AI trained to extract internships, fellowships, and research opportunities from unstructured text. 
Below is the text extracted from an Indian Government or Research institution website. 
Extract any valid, upcoming, or currently open internships, job openings, or research fellowships. 
For each opportunity, output a JSON object exactly matching this schema:
{{
    "title": "string",
    "description": "string",
    "organizer": "string (e.g., ISRO, DRDO, AICTE)",
    "event_type": "string (strictly 'Internship')",
    "mode": "string (strictly 'Online' or 'Offline')",
    "category": "string (e.g. AI/ML, Web Development, General)",
    "start_date": "ISO8601 string or null",
    "end_date": "ISO8601 string or null",
    "venue": "string",
    "registration_link": "{url}",
    "tags": ["string"]
}}

Return ONLY a valid JSON object with a single key 'events' containing the array of objects.
TEXT:
{text_content}
"""
                chat_completion = self.groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": prompt}
                    ],
                    model="llama-3.3-70b-versatile",
                    response_format={"type": "json_object"},
                )
                import json
                response_text = chat_completion.choices[0].message.content
                parsed_json = json.loads(response_text)
                ai_extracted = parsed_json.get("events", [])
                
                if ai_extracted and isinstance(ai_extracted, list):
                    for item in ai_extracted:
                        item["source_url"] = url
                        item["source_platform"] = "Govt & Research"
                        self.normalized_data.append(item)
                        
            except Exception as e:
                print(f"[{self.platform_name}] Error parsing {url}: {e}")
                
        print(f"[{self.platform_name}] Extracted {len(self.normalized_data)} opportunities via AI.")

    def normalize_with_ai(self):
        # Already normalized during parse phase using raw text
        pass

if __name__ == "__main__":
    s = GovtResearchScraper()
    s.run()
