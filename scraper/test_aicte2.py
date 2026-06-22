import requests
from bs4 import BeautifulSoup

url = "https://internship.aicte-india.org/"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
r = requests.get(url, headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')

print(f"Content length: {len(r.text)}")
cards = soup.select(".card, .internship-card, .job-card")
print(f"Cards found: {len(cards)}")

# Check for hidden API tokens or data
for s in soup.find_all('script'):
    if 'api' in s.text.lower() or 'fetch' in s.text.lower() or 'ajax' in s.text.lower():
        print("Script with api/ajax:", s.text[:200])
