import time
from unstop_scraper import UnstopScraper
from devfolio_scraper import DevfolioScraper
from hackerearth_scraper import HackerEarthScraper
from hackerrank_scraper import HackerRankScraper

def main():
    print("========================================")
    print("🚀 NEXUS EVENTS - MASTER SCRAPER RUNNER ")
    print("========================================")
    
    scrapers = [
        UnstopScraper(),
        DevfolioScraper(),
        HackerEarthScraper(),
        HackerRankScraper()
    ]
    
    total_events = 0
    start_time = time.time()
    
    for i, scraper in enumerate(scrapers):
        try:
            if i > 0:
                print(f"\n⏳ Sleeping for 16 seconds to prevent Gemini AI Rate Limits...")
                time.sleep(16)
                
            print(f"\n---> Starting {scraper.platform_name} pipeline...")
            scraper.run()
            total_events += len(scraper.normalized_data)
        except Exception as e:
            print(f"[ERROR] Failed to run {scraper.platform_name} scraper: {e}")
            
    elapsed_time = time.time() - start_time
    
    print("\n========================================")
    print("✅ MASTER SCRAPER RUN COMPLETE")
    print(f"⏱️  Time Elapsed: {elapsed_time:.2f} seconds")
    print(f"📊 Total Events Normalized & Saved: ~{total_events}")
    print("========================================")

if __name__ == "__main__":
    main()
