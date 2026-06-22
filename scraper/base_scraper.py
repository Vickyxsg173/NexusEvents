from abc import ABC, abstractmethod
import requests
import json
import os
import time
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

class BaseScraper(ABC):
    def __init__(self, platform_name, source_url):
        self.platform_name = platform_name
        self.source_url = source_url
        self.raw_data = []
        self.normalized_data = []
        self.api_base_url = os.getenv("API_BASE_URL", "http://localhost:5000/api/events")
        
        # Configure Groq
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            self.groq_client = Groq(api_key=api_key)
        else:
            self.groq_client = None

    def fetch_with_retries(self, url, headers=None, max_retries=3, backoff_factor=2):
        """
        Fetch a URL with exponential backoff and retry logic.
        Handles rate limits and temporary server errors gracefully.
        """
        for i in range(max_retries):
            try:
                response = requests.get(url, headers=headers, timeout=15)
                if response.status_code == 200:
                    return response
                elif response.status_code in [403, 429, 500, 502, 503, 504]:
                    print(f"[{self.platform_name}] HTTP {response.status_code} on attempt {i+1}. Retrying in {backoff_factor ** i}s...")
                    time.sleep(backoff_factor ** i)
                else:
                    print(f"[{self.platform_name}] HTTP {response.status_code} received. Not retrying.")
                    return response
            except requests.exceptions.RequestException as e:
                print(f"[{self.platform_name}] Request failed: {e}. Retrying in {backoff_factor ** i}s...")
                time.sleep(backoff_factor ** i)
        
        print(f"[{self.platform_name}] Max retries reached for {url}")
        return None

    @abstractmethod
    def fetch(self):
        """
        Fetch events from the source (HTML or API).
        Should populate self.raw_data.
        """
        pass

    @abstractmethod
    def parse(self):
        """
        Extract and clean raw event data from the fetched payload/HTML.
        """
        pass

    def normalize_with_ai(self):
        """
        Send raw data to Groq in batches to get the standardized JSON schema.
        """
        print(f"[{self.platform_name}] normalize_with_ai() called")
        
        if not self.raw_data:
            print(f"[{self.platform_name}] No raw data to normalize.")
            return

        if not self.groq_client:
            print(f"[{self.platform_name}] GROQ_API_KEY not found in backend/.env. Using mock normalization.")
            self._fallback_mock_normalization()
            return

        print(f"[{self.platform_name}] Sending {len(self.raw_data)} events to Groq for AI normalization in batches...")
        
        batch_size = 10
        all_normalized_events = []
        
        # Process in batches to stay under Groq's 12,000 TPM limit
        for i in range(0, len(self.raw_data), batch_size):
            batch = self.raw_data[i:i + batch_size]
            print(f"[{self.platform_name}] Processing batch {i//batch_size + 1} of {(len(self.raw_data)-1)//batch_size + 1} ({len(batch)} events)...")
            
            prompt = f"""
You are an expert data extraction service.
I will provide you with a JSON array of raw event data scraped from '{self.platform_name}'.
Your job is to cleanly extract this data into a standardized JSON array strictly following this schema without generating or hallucinating any missing details.

Schema:
{{
    "title": "string",
    "description": "string (Extract exactly what is provided. Do NOT generate or invent a description if it is missing)",
    "organizer": "string (name of the organizer, default to '{self.platform_name}' if missing)",
    "event_type": "string (e.g. Hackathon, Webinar, Workshop, Competition, Internship)",
    "category": "string (e.g. AI/ML, Web Development, Cybersecurity. Pick the best fit or 'General')",
    "mode": "string (Extract as 'Online' or 'Offline'. If address_data has physical location, it is Offline)",
    "start_date": "ISO8601 string or null (Extract from data, do not guess)",
    "end_date": "ISO8601 string or null (Extract from data, do not guess)",
    "venue": "string (Extract physical address/city if provided, otherwise 'Online' if online)",
    "registration_link": "string (Valid URL from data)",
    "cover_image": "string (Valid URL from data, or null)",
    "tags": ["string"] (Extract 3-5 factual keywords directly related to the event text)
}}

Return ONLY a valid JSON object with a single key 'events' containing the array of objects. Do not include markdown formatting.
            """
            
            try:
                chat_completion = self.groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": prompt
                        },
                        {
                            "role": "user",
                            "content": json.dumps(batch)
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    response_format={"type": "json_object"},
                )
                
                response_text = chat_completion.choices[0].message.content
                parsed_json = json.loads(response_text)
                batch_normalized = parsed_json.get("events", [])
                
                # Ensure source metadata is always accurate
                for event in batch_normalized:
                    event["source_platform"] = self.platform_name
                    if not event.get("source_url"):
                        event["source_url"] = event.get("registration_link") or (self.source_url + "/event/" + event.get("title", "unknown").replace(" ", "-"))
                    
                all_normalized_events.extend(batch_normalized)
                
                # Sleep to prevent hitting TPM limits
                if i + batch_size < len(self.raw_data):
                    print(f"[{self.platform_name}] Sleeping for 15 seconds to respect Groq rate limits...")
                    time.sleep(15)
                    
            except Exception as e:
                print(f"[{self.platform_name}] Groq API failed on batch {i//batch_size + 1}: {e}")
                print(f"[{self.platform_name}] Skipping failed batch and continuing...")
        
        if all_normalized_events:
            self.normalized_data = all_normalized_events
            print(f"[{self.platform_name}] Groq successfully normalized a total of {len(self.normalized_data)} events.")
        else:
            print(f"[{self.platform_name}] All Groq batches failed. Falling back to complete mock normalization...")
            self._fallback_mock_normalization()

    def _fallback_mock_normalization(self):
        # Fallback Mock Normalization
        self.normalized_data = []
        for raw_event in self.raw_data:
            # Determine event type based on title to avoid redundant "Hackathon" badges everywhere
            title = raw_event.get("title", "Unknown Event")
            e_type = "Event"
            if "hackathon" in title.lower(): e_type = "Hackathon"
            elif "webinar" in title.lower(): e_type = "Webinar"
            elif "workshop" in title.lower(): e_type = "Workshop"
            
            self.normalized_data.append({
                "title": title,
                "description": raw_event.get("description", ""),
                "organizer": self.platform_name,
                "event_type": e_type,
                "category": "General",
                "mode": raw_event.get("mode", "Online"),
                "start_date": raw_event.get("start_date", None),
                "end_date": raw_event.get("end_date", None),
                "registration_deadline": None,
                "venue": "Online",
                "city": None,
                "country": None,
                "meeting_link": None,
                "registration_link": raw_event.get("url", self.source_url),
                "prize_pool": None,
                "eligibility": None,
                "tags": ["Scraped", self.platform_name],
                "source_platform": self.platform_name,
                "source_url": raw_event.get("url") or (self.source_url + "/event/" + str(raw_event.get("title", "unknown")).replace(" ", "-")),
                "cover_image": raw_event.get("cover_image") or raw_event.get("image") or None
            })

    def save_to_db(self):
        print(f"[{self.platform_name}] Saving {len(self.normalized_data)} events to database...")
        success_count = 0
        for event in self.normalized_data:
            try:
                # Sanitize empty strings to None for strict PostgreSQL timestamp fields
                if not event.get("start_date"): event["start_date"] = None
                if not event.get("end_date"): event["end_date"] = None

                # Pop tags for separate insertion if needed
                tags = event.pop("tags", [])
                
                headers = {
                    "x-api-secret": os.getenv("SCRAPER_API_SECRET", "")
                }
                response = requests.post(self.api_base_url, json=event, headers=headers)
                if response.status_code == 201:
                    success_count += 1
                else:
                    print(f"Failed to save event {event['title']}: {response.text}")
            except Exception as e:
                print(f"Error saving event {event['title']}: {e}")
                
        print(f"[{self.platform_name}] Successfully saved {success_count} events.")

    def run(self):
        """
        Execute the full scraper pipeline with graceful failure handling.
        """
        try:
            self.fetch()
            # Handle class attributes that might not be set by all subclasses
            if hasattr(self, '_raw_response') and not self._raw_response and not self.raw_data:
                print(f"[{self.platform_name}] Fetch failed or returned empty data.")
                return
            
            if not self.raw_data and hasattr(self, 'parse'):
                self.parse()
                
            if self.raw_data:
                self.normalize_with_ai()
                self.save_to_db()
            else:
                print(f"[{self.platform_name}] No raw data parsed/found to normalize.")
        except Exception as e:
            print(f"\n[CRITICAL ERROR] {self.platform_name} scraper failed gracefully: {e}")
            print(f"Pipeline will continue to the next scraper to prevent halting.\n")
