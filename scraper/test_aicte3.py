import requests
from bs4 import BeautifulSoup

url = "https://internship.aicte-india.org/recentlyposted.php"
headers = {"User-Agent": "Mozilla/5.0"}
r = requests.get(url, headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')

print("All links on recentlyposted:")
for a in soup.find_all('a', href=True):
    if 'internship' in a['href'].lower() or 'detail' in a['href'].lower():
        print(a['href'])
