import time
from unstop_scraper import UnstopScraper
from devfolio_scraper import DevfolioScraper
from hackerearth_scraper import HackerEarthScraper
from hackerrank_scraper import HackerRankScraper

# The 10 NexusEvents Recommended Sources
from devpost_scraper import DevpostScraper
from gdg_scraper import GDGScraper
from ms_reactor_scraper import MSReactorScraper
from aws_events_scraper import AWSEventsScraper
from meetup_scraper import MeetupScraper
from hack2skill_scraper import Hack2SkillScraper
from cncf_scraper import CNCFScraper
from linux_foundation_scraper import LinuxFoundationScraper
from yc_jobs_scraper import YCJobsScraper
from github_interns_scraper import GithubInternsScraper

def main():
    print("========================================")
    print("🚀 NEXUS EVENTS - MASTER SCRAPER RUNNER ")
    print("========================================")
    
    scrapers = [
        UnstopScraper(),
        DevfolioScraper(),
        HackerEarthScraper(),
        HackerRankScraper(),
        DevpostScraper(),
        GDGScraper(),
        MSReactorScraper(),
        AWSEventsScraper(),
        MeetupScraper(),
        Hack2SkillScraper(),
        CNCFScraper(),
        LinuxFoundationScraper(),
        YCJobsScraper(),
        GithubInternsScraper()
    ]
    
    total_events = 0
    start_time = time.time()
    
    for i, scraper in enumerate(scrapers):
        try:
            if i > 0:
                print(f"\n⏳ Sleeping for 16 seconds to prevent Gemini/Groq AI Rate Limits...")
                time.sleep(16)
                
            print(f"\n---> Starting {scraper.platform_name} pipeline...")
            scraper.run()
            total_events += len(scraper.normalized_data)
        except Exception as e:
            # We catch any broad failure that might slip past the BaseScraper try/except
            print(f"[CRITICAL ERROR] Failed to run {scraper.platform_name} scraper: {e}")
            print(f"Moving to next scraper.")
            
    elapsed_time = time.time() - start_time
    
    print("\n========================================")
    print("✅ MASTER SCRAPER RUN COMPLETE")
    print(f"⏱️  Time Elapsed: {elapsed_time:.2f} seconds")
    print(f"📊 Total Events Normalized & Saved: ~{total_events}")
    print("========================================")

if __name__ == "__main__":
    main()
