import os
from supabase import create_client, Client

url: str = os.environ.get("VITE_SUPABASE_URL", "https://bsmrjnviyznzgxzmwgtx.supabase.co")
key: str = os.environ.get("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbXJqbnZpeXpuemd4em13Z3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDM0MTIsImV4cCI6MjA5NzExOTQxMn0.4VeOHO42jQHlCivhcctZAkanDPfHDSnjQRnv4Zom4TE")
supabase: Client = create_client(url, key)

response = supabase.table("events").select("id, title, start_date").execute()
events = response.data

if not events:
    print("No events found in DB.")
else:
    print(f"Total events in DB: {len(events)}")
    print("Sample dates:")
    for e in events[:20]:
        print(f" - {e['start_date']} | {e['title']}")

    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    ten_days_ago = now - timedelta(days=10)
    
    valid_count = sum(1 for e in events if e.get('start_date') is None or (e.get('start_date') and datetime.fromisoformat(e['start_date'].replace('Z', '+00:00')) >= ten_days_ago))
    print(f"\nEvents passing strict 10-day filter: {valid_count} / {len(events)}")
